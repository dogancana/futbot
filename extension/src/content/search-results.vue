<template>
  <div class="root">
    <div v-if="!targetAdding && !targetAddingResult" class="actions">
      <p>
        Your search query:
        {{ lastSearch ? lastSearch.split('?')[1].replace(/&/g, ' ') : 'Error' }}
      </p>
      <input
        v-model="sellPrice"
        type="tel"
        class="numericInput"
        placeholder="Sell price"
      />
      <button v-on:click="addTarget" class="btn-standard mini call-to-action">
        Add Query
      </button>
    </div>
    <div v-if="targetAdding">Working...</div>
    <div v-if="targetAddingResult" v-on:click="clearTarget">
      {{ this.targetAddingResult }}
    </div>
  </div>
</template>

<script>
import { interceptXHR } from './auth.js';
import { addTargetQueryToAutoBuy } from './futbot/auto-buy.js';
let lastSearch = null;

interceptXHR('fifa20/transfermarket', req => {
  lastSearch = req.responseURL;
});

export default {
  data: () => ({
    lastSearch,
    sellPrice: null,
    targetAdding: false,
    targetAddingResult: null
  }),
  methods: {
    addTarget() {
      const q = lastSearch ? lastSearch.split('?')[1] : null;
      if (!q) {
        alert('There was an error, search again');
        return;
      }

      let sellPrice = parseInt(this.sellPrice, 10);
      sellPrice = !isNaN(sellPrice) ? sellPrice : null;

      if (
        confirm(
          `Adding query ${q} to your auto buy list with selling price: ${sellPrice}.\n\n` +
            `This feature is powerfull and there are no price checks.\n\n` +
            `You can buy 20 wrong players under 5 seconds.\n\n` +
            `Are you absolutely sure to continue?`
        )
      ) {
        try {
          this.targetAdding = true;
          addTargetQueryToAutoBuy(q, sellPrice).then(resp => {
            this.targetAddingResult = resp;
            this.targetAdding = false;
          });
        } catch (e) {
          this.targetAddingResult = e;
          this.targetAdding = false;
        }
      }
    },
    clearTarget() {
      this.sellPrice = null;
      this.targetAdding = false;
      this.targetAddingResult = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.root {
  height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  background-color: #fff;
  z-index: 1;
  font-size: 1rem;
  padding: 0 1rem;
  box-sizing: border-box;
}

.actions {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.actions p {
  max-width: 50%;
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
  margin-left: auto;
}
</style>

<style>
.SearchResults {
  flex-direction: column-reverse;
}
</style>
