<template>
  <v-collapse-wrapper>
    <div v-collapse-toggle class="toggle">
      <h3>Auto buy list</h3>
    </div>
    <div class="content-wrapper" v-collapse-content>
      List
    </div>
  </v-collapse-wrapper>
</template>

<script>
import Vue from 'vue'
const AutoBuyList = {
  props: [],
  data: function () {
    return {
      list: null,
      loading: false,
      error: null
    }
  },
  methods: {
    onToggle (toggled) {
      if (toggled) this.handleListLoad()
    },
    handleListLoad () {
      if (!this.list && !this.loading) {
        this.loading = true
      }
    }
  }
}
Vue.component('v-auto-buy-list', AutoBuyList)
export default AutoBuyList
</script>

<style lang='scss' scoped>
  .root {
    width: 100%;
    z-index: 1;
  }

</style>
