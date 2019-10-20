<template>
  <div class="root">
    <v-collapsible :onToggle="onToggle">
      <div class="info-box">
        <p v-if="priceLoading">Loading...</p>
        <p v-if="priceError">{{ priceError }}</p>
        <div class="price" v-if="price">
          <p>
            <span>Futbin:</span>
            <span>{{ price.futbinPrice }}</span>
          </p>
          <p>
            <span>Min market buy now:</span>
            <span>{{ price.marketPrice.minBuyNow }}</span>
          </p>
          <p>
            <span>Market samples:</span>
            <span>{{ price.marketPrice.sampleCount }}</span>
          </p>
        </div>
        <div class="actions">
          <div v-if="!targetAdded">
            <input v-model="targetPrice" class="target-price" />
            <button
              v-on:click="addTarget"
              class="btn-standard mini call-to-action"
            >
              Add Target
            </button>
          </div>
          <div v-if="targetAdded">Added to targets list.</div>
        </div>
      </div>
    </v-collapsible>
  </div>
</template>

<script>
import { getPlayerPrice } from './futbot/player.js';
import { addTargetToAutoBuy } from './futbot/auto-buy';

export default {
  props: ['item'],
  data: function() {
    return {
      price: null,
      priceLoading: false,
      priceError: null,
      targetPrice: null,
      targetAdding: false,
      targetAddingError: null,
      targetAdded: null
    };
  },
  methods: {
    onToggle(toggled) {
      this.priceError = null;
      if (toggled) this.handlePriceLoad();
    },
    handlePriceLoad() {
      if (!this.priceLoading) {
        this.priceLoading = true;
        getPlayerPrice(this.item._metaData.id, this.item.resourceId)
          .then(d => {
            this.price = {
              ...d,
              futbinPrice: d.futbinPrice
                ? d.futbinPrice.prices.slice(0, 2).join()
                : 'Error'
            };
            this.priceLoading = false;
            this.priceError = null;
          })
          .catch(e => {
            this.price = null;
            this.priceLoading = false;
            this.priceError = e.message;
          });
      }
    },
    addTarget() {
      if (!this.targetPrice) {
        alert('Enter a price first!');
      }
      try {
        const price = parseInt(this.targetPrice, 10);
        if (price < 0) {
          alert('Wtf is this price?');
          return;
        }
        addTargetToAutoBuy(
          this.item._metaData.id,
          this.item.resourceId,
          this.targetPrice
        )
          .then(resp => (this.targetAdded = resp))
          .catch(e => (this.targetAddingError = e));
      } catch (e) {}
    }
  }
};
</script>

<style lang="scss" scoped>
.root {
  width: 100%;
  z-index: 1;
  font-size: 1rem;
}

.info-box {
  width: 100;
  display: flex;
  padding: 10px;
  color: slategray;
}

.actions {
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-bottom: 1rem;
}

.actions input {
  width: 80px;
  border: 1px solid lightslategrey;
  min-height: 1.5rem;
  padding: 2px;
  padding-left: 0.5rem;
  margin-bottom: 0.5rem;
}
</style>

<style>
.listFUTItem {
  flex-direction: column-reverse;
  z-index: 0;
}
</style>
