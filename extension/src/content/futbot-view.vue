<template>
  <div class="wrapper">
    <v-collapsible>
      <div class="view">
        <p>Auth read: {{ authRead }}</p>
        <p>
          <v-auto-buy-list />
        </p>
      </div>
    </v-collapsible>
  </div>
</template>

<script>
import { request } from './utils/request';

export default {
  data: function() {
    return {
      authRead: undefined
    };
  },
  methods: {
    async updateServerStatus() {
      try {
        const resp = await request('http://localhost:9999/auth');
        if (resp.auth) this.authRead = true;
        else this.authRead = false;
      } catch (e) {
        this.authRead = false;
      }
    }
  },
  mounted: function() {
    this.updateServerStatus();
  }
};
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  color: slategray;
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
