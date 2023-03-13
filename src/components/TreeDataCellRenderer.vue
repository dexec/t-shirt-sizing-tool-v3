<template>
  <div :style="'margin-left:' + stuff.node.data.lvl * 20 + 'px'">
    <v-btn size="x-small" :style="stuff.node.data.children.length>0 ? 'visibility:visible':'visibility:hidden'"
           @click="changeOpenState">
      <v-icon size="x-small" v-if="!stuff.node.data.open">mdi-plus</v-icon>
      <v-icon size="x-small" v-else>mdi-minus</v-icon>
    </v-btn>
    {{ stuff.value }}
  </div>
</template>

<script>

import {nextTick} from "vue";
import { usePaketeStore } from '@/stores/pakete'

export default {
  name: "TestComp",
  setup(props) {
    return { stuff: props.params };
  },
  methods: {
    changeOpenState() {
      const paketeStore = usePaketeStore();
      let aktuellesPaket = this.stuff.node.data;
      aktuellesPaket.open = !aktuellesPaket.open;
      this.stuff.node.setData(aktuellesPaket);
      paketeStore.updateTreeView(aktuellesPaket);
      nextTick(() => this.stuff.api.setRowData(paketeStore.getTreeView))
    }
  }
}
</script>

<style scoped>

</style>