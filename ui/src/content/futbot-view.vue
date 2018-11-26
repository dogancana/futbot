<template>
  <v-collapsible>
    <div class="root">
      <p>Server status: {{ serverAuth }}</p>
    </div>
  </v-collapsible>
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
  .root {
    padding: 10px;
    flex: 1;
    background-color: #f2f6ff;
  }
</style>

<style>
</style>
