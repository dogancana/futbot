import { Job } from "../job";
import { investService } from "./invest-service";
import { playerService } from "../player";
import { uniq, pick } from 'lodash'
import { fut } from "../api";
import { getOptimalSellPrice, tradePrice } from "../trader/trade-utils";
import { logger } from "../logger";

const BUY_REFERENCE_PERCT = .75
const MAX_AUCTION_TRY = 10
let targets = []

export class LowPlayerInvestor extends Job {
  private spent: number
  private budget: number
  private boughtPlayers: ({ price: number, assetId: number })[]

  constructor (budget: number) {
    const name = 'Invest:LowPlayerInvestor'

    const buyTargets = async () => {
      if (!targets || targets.length === 0) setupTargets()

      if (this.budget < 1000) this.stop()

      const target = targets.shift()
      const playerStr = playerService.readable({ assetId: target })
      const value = await getOptimalSellPrice(target)
      const safeBuyValue = value.startingBid * BUY_REFERENCE_PERCT
      const price = p => p.currentBid != 0 ? p.currentBid : p.startingBid
      let batch = 0
      while (true) {
        let auctions = (await fut.getPlayerTransferData(target, batch++, { maxb: tradePrice(safeBuyValue) }))
          .filter(a => !a.watched)
          .filter(a => !a.tradeOwner)
          .filter(a => a.itemData.resourceId === target)
          .map(a => pick(a, 'tradeId', 'buyNowPrice', 'currentBid', 'startingBid', 'expires'))
        auctions = auctions.sort((a, b) => a.buyNowPrice - b.buyNowPrice)

        if (auctions.length === 0) {
          break
        }

        const lowest = auctions[0]
        const lowestTargetPrice =  price(lowest)
        if (lowestTargetPrice <= safeBuyValue) {
          if (this.budget <= lowest.buyNowPrice) {
            break
          } 
          const resp = fut.bid(lowest.tradeId, lowest.buyNowPrice)
          if (resp) {
            logger.info(`${name} bid ${playerStr} with ${lowest.buyNowPrice}`)
            this.boughtPlayers.push({
              price: lowest.buyNowPrice,
              assetId: target
            })
            this.spent += lowest.buyNowPrice
            this.budget -= lowest.buyNowPrice

            setTimeout(async () => {
              const purchased = await fut.getPurchasedItems()
              const sellTarget = purchased.filter(p => p.assetId === target)[0]
  
              if (sellTarget) {
                await fut.sellPlayer({
                  ...(await getOptimalSellPrice(target)),
                  duration: 3600,
                  itemData: { id: sellTarget.id, assetId: sellTarget.assetId }
                })
              } else {
                logger.info(`${playerStr} was not found in purchased list`)
              }
            }, 1000)
          }
          break
        }

        if (batch > MAX_AUCTION_TRY) break
      }
    }

    super(
      name,
      10,
      buyTargets
    )

    this.budget = budget
    this.spent = 0
    this.boughtPlayers = []
  }

  public report () {
    return {
      budget: this.budget,
      spent: this.spent,
      boughtPlayers: this.boughtPlayers.map(p => ({
        price: p.price,
        name: playerService.readable({ assetId: p.assetId })
      })),
    }
  }
}

async function setupTargets () {
  const clubPlayers = await fut.getClubPlayers()
  const isInClubPlayers = ((id: number) => clubPlayers.filter(p => p.assetId === id).length > 0)

  for (let i=0; i<10; i++) {
    targets = targets.concat(await investService.getTargets({ page: i }))
  }

  targets = uniq(targets)
  targets = targets.filter(t => !isInClubPlayers(t))
}
