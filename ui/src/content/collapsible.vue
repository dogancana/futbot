<template>
  <v-collapse-wrapper>
    <div @click="toggle" v-bind:class="{ 'toggled': toggled }" v-collapse-toggle class="toggle"></div>
    <div class="content-wrapper" v-collapse-content>
      <slot></slot>
    </div>
  </v-collapse-wrapper>
</template>

<script>
import Vue from "vue";
const Collapsible = {
  props: ["onToggle"],
  data: function() {
    return { toggled: false };
  },
  methods: {
    toggle(event) {
      this.toggled = !this.toggled;
      if (this.onToggle) this.onToggle(this.toggled);
    }
  }
};
Vue.component("v-collapsible", Collapsible);
export default Collapsible;
</script>

<style lang='scss' scoped>
$size: 20px;
$color: midnightblue;

.vc-collapse {
  position: relative;
}

.toggle {
  position: absolute;
  top: 0;
  right: 15%;
  z-index: 2;
  cursor: pointer;

  width: 0;
  height: 0;
  border-color: $color;
  border-left: $size solid transparent;
  border-right: $size solid transparent;
  border-top: $size solid;
  margin-bottom: -$size;
  transition: all ease-in 0.3s;

  &.toggled {
    top: auto;
    bottom: 20px;
    transform: rotate(180deg);
  }
}
</style>

<style global>
.v-collapse-content {
  max-height: 0;
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  padding: 0;
}

.v-collapse-content-end {
  transition: max-height 0.3s ease-in;
  max-height: 100px;
}
</style>
