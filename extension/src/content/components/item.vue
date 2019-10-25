<template>
  <div class="root">
    <v-collapsible :onToggle="onToggle">
      <div class="info-box">
        <p v-if="priceLoading">Loading prices...</p>
        <p v-if="priceError">{{ priceError }}</p>
        <div class="price" v-if="price">
          <p>
            <span>Price:</span>
            <span>{{ price.buyNowPrice }}</span>
          </p>
        </div>
        <div class="actions">
          <div
            v-if="!targetAdding && !targetAddingResult"
            class="target-actions"
          >
            <input
              v-model="sellPrice"
              type="tel"
              class="numericInput"
              placeholder="Sell price"
            />
            <input
              v-model="targetPrice"
              type="tel"
              class="numericInput"
              placeholder="Buy price"
            />
            <button
              v-on:click="addTarget"
              class="btn-standard mini call-to-action"
            >
              Add Target
            </button>
          </div>
          <div v-if="targetAdding">Working...</div>
          <div v-if="targetAddingResult" v-on:click="clearTarget">
            {{ this.targetAddingResult }}
          </div>
        </div>
      </div>
    </v-collapsible>
  </div>
</template>

<script>
import { getPlayerPrice } from '../futbot/player.js';
import { addTargetToAutoBuy } from '../futbot/auto-buy';
import { isNumber } from 'util';

const initialProps = () => ({
  price: null,
  priceLoading: false,
  priceError: null,
  targetPrice: null,
  sellPrice: null,
  targetAdding: false,
  targetAddingResult: null,
  itemType: null
});

export default {
  props: ['item'],
  data: function() {
    return initialProps();
  },
  mounted() {},
  methods: {
    clear() {
      Object.assign(this, initialProps());
    },
    onToggle(toggled) {
      this.priceError = null;
      if (toggled) this.handlePriceLoad();
      else this.clear();
    },
    handlePriceLoad() {
      if (!this.priceLoading) {
        this.priceLoading = true;
        getPlayerPrice(this.item._metaData.id, this.item.resourceId)
          .then(d => {
            this.price = d.price;
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
      if (this.targetAdding) {
        return;
      }
      if (!this.targetPrice) {
        alert('Enter a buy price first.');
        return;
      }
      try {
        const price = parseInt(this.targetPrice, 10);
        const sellPrice = parseInt(this.sellPrice, 10);

        this.targetPrice = price;
        this.sellPrice = sellPrice;

        if (price < 0 || sellPrice < 0) {
          alert('Why you have negative prices?');
          return;
        }
        if (sellPrice && price > sellPrice) {
          alert(
            "Don't you want to make profit? Why buy price is bigger than sell price/"
          );
          return;
        }
        this.targetAdding = true;
        addTargetToAutoBuy(
          this.item._metaData.id,
          this.item.resourceId,
          this.targetPrice,
          this.sellPrice,
          this.item
        ).then(resp => {
          this.targetAddingResult = resp;
          this.targetAdding = false;
          this.targetPrice = null;
          this.sellPrice = null;
        });
      } catch (e) {
        this.targetAdding = false;
        this.targetAddingResult = e;
      }
    },
    clearTarget() {
      this.targetAdding = false;
      this.targetAddingResult = null;
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
  align-self: flex-end;
  display: flex;
  flex-direction: column;
  margin-left: auto;
  margin-bottom: 2rem;
}

.target-actions {
  display: flex;
}

.actions input,
.actions button {
  min-width: 80px;
  max-width: 100px;
  height: 2.4rem;
  margin: 0;
  margin-right: 0.4rem;
  box-sizing: border-box;
}

.actions button {
  margin: 0;
}

.actions input {
  border: 1px solid lightslategrey;
  padding: 2px;
  padding-left: 0.5rem;
}
</style>

<style>
.listFUTItem {
  flex-direction: column-reverse;
  z-index: 0;
}
</style>
