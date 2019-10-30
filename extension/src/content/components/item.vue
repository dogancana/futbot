<template>
  <div class="root">
    <v-collapsible :onToggle="onToggle">
      <div class="info-box">
        <p v-if="valueLoading">Loading values...</p>
        <p v-if="valueError">{{ valueError }}</p>
        <div class="value" v-if="value">
          <p>
            <span>Futbin:</span>
            <span>{{ value.futbinPrice }}</span>
          </p>
          <p>
            <span>Price:</span>
            <span>{{ value.price }}</span>
          </p>
          <p>
            <span>Samples Used:</span>
            <span>{{ value.samples.length }}</span>
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
              placeholder="Sell value"
            />
            <input
              v-model="targetPrice"
              type="tel"
              class="numericInput"
              placeholder="Buy value"
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
  value: null,
  valueLoading: false,
  valueError: null,
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
      this.valueError = null;
      if (toggled) this.handlePriceLoad();
      else this.clear();
    },
    handlePriceLoad() {
      if (!this.valueLoading) {
        this.valueLoading = true;
        getPlayerPrice(this.item._metaData.id, this.item.resourceId)
          .then(d => {
            this.value = d.value;
            this.valueLoading = false;
            this.valueError = null;
          })
          .catch(e => {
            this.value = null;
            this.valueLoading = false;
            this.valueError = e.message;
          });
      }
    },
    addTarget() {
      if (this.targetAdding) {
        return;
      }
      if (!this.targetPrice) {
        alert('Enter a buy value first.');
        return;
      }
      try {
        const targetPrice = parseInt(this.targetPrice, 10);
        const sellPrice = parseInt(this.sellPrice, 10);

        this.targetPrice = targetPrice;
        this.sellPrice = sellPrice;

        if (targetPrice < 0 || sellPrice < 0) {
          alert('Why you have negative values?');
          return;
        }
        if (sellPrice && targetPrice > sellPrice) {
          alert(
            "Don't you want to make profit? Why buy value is bigger than sell value/"
          );
          return;
        }
        this.targetAdding = true;
        addTargetToAutoBuy(
          this.item._metaData.id,
          this.item.resourceId,
          targetPrice,
          sellPrice,
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
