<template>
  <div :style="'margin-left:' + params.node.data.lvl * 30 + 'px'">
    <v-btn :style="params.node.data.children.length>0 ? 'visibility:visible':'visibility:hidden'" size="x-small"
           @click="changeOpenState">
      <v-icon v-if="!params.node.data.open" size="x-small">mdi-plus</v-icon>
      <v-icon v-else size="x-small">mdi-minus</v-icon>
    </v-btn>
    {{ params.value }}
  </div>
</template>
<script lang="ts" setup>

import { nextTick } from "vue";
import { usePaketeStore } from "@/stores/pakete";

const props = defineProps(["params"]);

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
    props.params.columnApi.autoSizeColumn('ticket_nr')
  });
}
</script>
