<template>
  <div class='root'>
    <v-collapse-wrapper>
      <div 
        @click="toggle" 
        v-bind:class="{ 'toggled': toggled }"
        v-collapse-toggle 
        class="toggle" 
      ></div>
      <div class="content-wrapper" v-collapse-content>
        <p v-if="priceLoading">Loading...</p>
        <p v-if="priceError">{{ priceError }}</p>
        <div class="price" v-if="price">
          <p><span>Futbin: </span><span>{{ price.futbinPrice.prices.slice(0,2).join() }}</span></p>
          <p><span>Min market buy now: </span><span>{{ price.marketPrice.minBuyNow }}</span></p>
          <p><span>Market samples: </span><span>{{ price.marketPrice.samplecount }}</span></p>
        </div>
      </div>
    </v-collapse-wrapper>
  </div>
</template>

<script>
import { getPlayerPrice } from '../futbot/player.js'

export default {
  props: [ 'item' ],
  data: function () {
    return {
      price: null,
      priceLoading: false,
      priceError: null,
      toggled: false
    }
  },
  methods: {
    toggle (event) {
      this.toggled = !this.toggled
      this.handlePriceLoad()
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
            this.priceError = 'Something went wrong'
            console.log('Player price error', e)
          })
      }
    }
  }
}
</script>

<style lang='scss' scoped>
  $color: midnightblue;

  .root {
    width: 100%;
    z-index: 1;
  }

  .toggle {
    $size: 20px;

    position: absolute;
    top: 0;
    right: 5%;
    z-index: 2;
    cursor: pointer;

    width: 0; 
    height: 0;
    border-color: $color;
    border-left: $size solid transparent;
    border-right: $size solid transparent;
    border-top: $size solid;
    margin-bottom: -$size;
    transition: ease-in .3s;
    
    &.toggled {
      transform: rotate(180deg);
    }

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
