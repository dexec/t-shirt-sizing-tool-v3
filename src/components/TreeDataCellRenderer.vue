<template>
  <div v-if="tree" :style="'margin-left:' + params.node.data.lvl * 30 + 'px'">
    <v-btn size="x-small" :style="params.node.data.children.length>0 ? 'visibility:visible':'visibility:hidden'"
           @click="changeOpenState">
      <v-icon size="x-small" v-if="!params.node.data.open">mdi-plus</v-icon>
      <v-icon size="x-small" v-else>mdi-minus</v-icon>
    </v-btn>
    {{ params.value }}
  </div>
  <div v-else>
    {{params.value}}
  </div>
</template>

<script>

import {nextTick} from "vue";
import {usePaketeStore} from '@/stores/pakete'

export default {
  name: "TestComp",
  data() {
    return {
      tree: true
    }
  },
  setup(props) {
    return {
      params: props.params,
    };
  },
  methods: {
    changeOpenState() {
      const paketeStore = usePaketeStore();
      let aktuellesPaket = this.params.node.data;
      aktuellesPaket.open = !aktuellesPaket.open;
      this.params.node.setSelected(true)
      this.params.node.setData(aktuellesPaket);
      paketeStore.updateTreeViewAfterChangedOpenState(aktuellesPaket);
      nextTick(() => this.params.api.setRowData(paketeStore.getTreeView))
    },
    switchFlatAndTree() {
      this.tree = !this.tree
      this.params.api.refreshCells({columns:['ticket_nr']})
    }
  }
}
</script>
