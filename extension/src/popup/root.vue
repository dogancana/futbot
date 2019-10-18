<template>
  <div id="root">
    <h3>Futbot</h3>
    <div class="info">Your fut endpoint: {{ endpoint }}</div>
  </div>
</template>
<script>
export default {
  data: function() {
    return {
      endpoint: null
    };
  },
  mounted() {
    chrome.storage.sync.get('futbot_endpoint', result => {
      this.endpoint = result.futbot_endpoint;
    });
  }
};
</script>
<style lang="scss" scoped>
#root {
  min-width: 200px;
}

.info {
  white-space: nowrap;
}
</style>
