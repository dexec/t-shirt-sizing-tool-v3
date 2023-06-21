<template>
  <div :style="'margin-left:' + params.node.data.lvl * 30 + 'px'">
    <v-btn size="x-small" :style="params.node.data.children.length>0 ? 'visibility:visible':'visibility:hidden'"
           @click="changeOpenState">
      <v-icon size="x-small" v-if="!params.node.data.open">mdi-plus</v-icon>
      <v-icon size="x-small" v-else>mdi-minus</v-icon>
    </v-btn>
    {{ params.value }}
  </div>
</template>
<script setup lang="ts">

import {nextTick} from "vue";
import {usePaketeStore} from '@/stores/pakete'

const props = defineProps(['params']);

function changeOpenState() {
  const paketeStore = usePaketeStore();
  const aktuellesPaket = props.params.node.data;
  aktuellesPaket.open = !aktuellesPaket.open;
  props.params.node.setSelected(true);
  props.params.node.setData(aktuellesPaket);
  paketeStore.updateTreeViewAfterChangedOpenState(aktuellesPaket);
  nextTick(() => {
    props.params.api.setRowData(paketeStore.paketeAsTreeView);
    props.params.api.setFocusedCell(props.params.api.getRowNode(aktuellesPaket.id).rowIndex, props.params.column);
  })
}

function switchFlatAndTree() {

}
</script>
<!--<script>

import {nextTick} from "vue";
import {usePaketeStore} from '@/stores/pakete'

export default {
  name: "TestComp",
  setup(props) {
    return {
      params: props.params,
    };
  },
  methods: {
    changeOpenState() {
      console.log(this.params)
      const paketeStore = usePaketeStore();
      let aktuellesPaket = this.params.node.data;
      aktuellesPaket.open = !aktuellesPaket.open;
      this.params.node.setSelected(true)
      this.params.node.setData(aktuellesPaket);
      paketeStore.updateTreeViewAfterChangedOpenState(aktuellesPaket);
      nextTick(() => this.params.api.setRowData(paketeStore.paketeAsTreeView))
    },
    switchFlatAndTree() {

    }
  }
}
</script>-->
