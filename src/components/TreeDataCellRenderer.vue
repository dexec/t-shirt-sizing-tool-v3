<template>
  <div :style="'margin-left:' + params.node.data.lvl * 30 + 'px'">
    <button id="treeDataToggle" :style="treeDataToggleStyle()"
            @click="changeOpenState">
      <v-icon class="chevronIcon" v-if="!params.node.data.open">mdi-chevron-right</v-icon>
      <v-icon class="chevronIcon" v-else>mdi-chevron-down</v-icon>
    </button>
    {{ params.value }}
  </div>
</template>
<script lang="ts" setup>

import { nextTick } from "vue";
import { usePaketContainer } from "@/stores/paketContainer";

const props = defineProps(["params"]);

function treeDataToggleStyle() {
  if(props.params.node.data.children.length>0) return 'visibility:visible'
  return 'visibility:hidden'
}
function changeOpenState() {
  const paketContainer = usePaketContainer();
  const aktuellesPaket = props.params.node.data;
  aktuellesPaket.open = !aktuellesPaket.open;
  props.params.node.setSelected(true);
  props.params.node.setData(aktuellesPaket);
  paketContainer.updateTreeViewAfterChangedOpenState(aktuellesPaket);
  nextTick(() => {
    props.params.api.setGridOption("rowData", paketContainer.paketeAsTreeView);
    props.params.api.setFocusedCell(props.params.api.getRowNode(aktuellesPaket.id).rowIndex, props.params.column);
    props.params.api.autoSizeColumns(["ticket_nr"]);
  });
}
</script>
<style scoped>
#treeDataToggle {
  display: flex; align-items: center;
}
.chevronIcon {

}

.chevronIcon:hover {

}
</style>