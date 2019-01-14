<template>
  <div class="root">
    <v-collapsible :onToggle="onToggle">
      <p v-if="priceLoading">Loading...</p>
      <p v-if="priceError">{{ priceError }}</p>
      <div class="price" v-if="price">
        <p><span>Futbin: </span><span>{{ price.futbinPrice.prices.slice(0,2).join() }}</span></p>
        <p><span>Min market buy now: </span><span>{{ price.marketPrice.minBuyNow }}</span></p>
        <p><span>Market samples: </span><span>{{ price.marketPrice.samplecount }}</span></p>
      </div>
    </v-collapsible>
  </div>
</template>

<script>
import { getPlayerPrice } from './futbot/player.js'

export default {
  props: [ 'item' ],
  data: function () {
    return {
      price: null,
      priceLoading: false,
      priceError: null
    }
  },
  methods: {
    onToggle (toggled) {
      if (toggled) this.handlePriceLoad()
    },
    handlePriceLoad () {
      if (!this.price && !this.priceLoading) {
        this.priceLoading = true
        getPlayerPrice(this.item._metaData.id, this.item.resourceId)
          .then(d => {
            this.price = d
            this.priceLoading = false
            this.priceError = null
          })
          .catch(e => {
            this.price = null
            this.priceLoading = false
            this.priceError = e.message
            console.log('Player price error', e)
          })
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  .root {
    width: 100%;
    z-index: 1;
  }

  .price {
    padding: 10px;
    color: slategray;
    font-size: 1rem;
  }
</style>

<style>
  .listFUTItem {
    flex-direction: column-reverse;
    z-index: 0;
  }
</style>
ƒ