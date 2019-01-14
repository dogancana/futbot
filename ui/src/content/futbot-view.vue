<template>
  <div class="wrapper">
    <v-collapsible>
      <div class="view">
        <p>Server status: {{ serverAuth }}</p>
        <p><v-auto-buy-list /></p>
      </div>
    </v-collapsible>
  </div>
</template>

<script>
import { request } from '../utils/request'

export default {
  data: function () {
    return {
      serverAuth: undefined
    }
  },
  methods: {
    async updateServerStatus () {
      try {
        const resp = await request('http://localhost:9999/auth')
        if (resp.auth) this.serverAuth = true
      } catch (e) {
        this.serverAuth = false
      }
    }
  },
  mounted: function () {
    this.updateServerStatus()
  }
}
</script>

<style lang='scss' scoped>
  .wrapper {
    width: 100%;
  }

  .view {
    width: 100%;
    padding: 10px;
    flex: 1;
    background-color: #f2f6ff;
  }
</style>


<style>
  .FUINavigationContent > *:first-child {
    flex-direction: column;
  }
</style>
