<template>
  <div :style="'margin-left:' + this.params.node.data.lvl * 20 + 'px'">
    <v-btn size="x-small" :style="this.params.node.data.children.length>0 ? 'visibility:visible':'visibility:hidden'"
           @click="changeOpenState">
      <v-icon size="x-small" v-if="!this.params.node.data.open">mdi-plus</v-icon>
      <v-icon size="x-small" v-else>mdi-minus</v-icon>
    </v-btn>
    {{ this.params.value }}
  </div>
</template>

<script>

import {nextTick} from "vue";
import { usePaketeStore } from '@/stores/pakete'

export default {
  name: "TestComp",
  methods: {
    shift() {
      return "margin-left: " + this.params.node.data.lvl * 20 + "px"
    },
    changeOpenState() {
      const paketeStore = usePaketeStore()
      //this.params.node.setSelected(true);
      let aktuellesPaket = this.params.node.data;
      paketeStore.changeOpenState(aktuellesPaket)
      nextTick(() => this.params.api.setRowData(paketeStore.getTreeView))
    }
  }
}
</script>

<style scoped>

</style>