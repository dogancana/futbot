import { Job } from "../job";
import { investService } from "./invest-service";
import { playerService } from "../player";
import { uniq, pick } from 'lodash'
import { fut } from "../api";
import { getOptimalSellPrice, tradePrice } from "../trader/trade-utils";
import { logger } from "../logger";

const BUY_REFERENCE_PERCT = .7
const MAX_AUCTION_TRY = 3
const WAIT_TRANSFER_PROCESSING_TIME = 5 * 1000
const MIN_TARGET_PRICE = 1000
const MAX_TARGET_PRICE = 4000
const MAX_TARGET_POOL = 30
let targets: investService.TargetInfo[] = []
let setingUp = false

export interface LowPlayerInvestorProps {
  budget: number
  min?: number
  max?: number
  maxTargetPool?: number
}
export class LowPlayerInvestor extends Job {
  private spent: number
  private budget: number
  private boughtPlayers: ({ price: number, assetId: number })[]

  constructor ({ budget, min, max, maxTargetPool }: LowPlayerInvestorProps) {
    const name = 'Invest:LowPlayerInvestor'

    const buyTargets = async () => {
      const minPrice = min || MIN_TARGET_PRICE
      const maxPrice = max || MAX_TARGET_PRICE
      const pcPrice = `${minPrice}-${maxPrice}`

      if (!targets || targets.length === 0) {
        setupTargets(pcPrice, maxTargetPool || MAX_TARGET_POOL)
        return
      }

      if (this.budget < minPrice) {
        investService.clearLowPlayerInvest()
        return
      }

      const target = targets.shift()
      const playerStr = playerService.readable({ assetId: target.assetId })
      const value = await getOptimalSellPrice(target.resourceId)
      if (!value) return

      const safeBuyValue = value.startingBid * BUY_REFERENCE_PERCT
      const price = p => p.currentBid != 0 ? p.currentBid : p.startingBid
      let batch = 0
      while (true) {

        let auctions = (await fut.getPlayerTransferData(target.resourceId, batch++, { maxb: tradePrice(safeBuyValue) }))
          .filter(a => !a.watched)
          .filter(a => !a.tradeOwner)
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
              assetId: target.assetId
            })
            this.spent += lowest.buyNowPrice
            this.budget -= lowest.buyNowPrice

            setTimeout(async () => {
              const purchased = await fut.getPurchasedItems()
              const sellTarget = purchased.filter(p => p.resourceId === target.resourceId)[0]
  
              if (sellTarget) {
                await fut.sellPlayer({
                  ...(await getOptimalSellPrice(target.resourceId)),
                  duration: 3600,
                  itemData: { id: sellTarget.id, assetId: sellTarget.assetId }
                })
              } else {
                logger.info(`${playerStr} was not found in purchased list`)
              }
            }, WAIT_TRANSFER_PROCESSING_TIME)
          }
          break
        }

        if (batch > MAX_AUCTION_TRY) break
      }
    }

    super(
      name,
      5,
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

async function setupTargets (price: string, maxTargets: number) {
  if (setingUp) return

  setingUp = true
  const pageLimit = Math.ceil(maxTargets/30)
  const platform = await fut.getPlatform()
  const priceKey = `${platform.toLowerCase()}_price`
  const clubPlayers = await fut.getClubPlayers()
  const isInClubPlayers = ((resourceId: number) => clubPlayers.filter(p => p.resourceId === resourceId).length > 0)
  
  for (let i=0; i<pageLimit; i++) {
    targets = targets.concat(await investService.getTargets({ 
      page: i,
      [priceKey]: price
    }))
  }

  targets = uniq(targets)
  targets = targets.filter(t => !isInClubPlayers(t.resourceId))
  setingUp = false
}
