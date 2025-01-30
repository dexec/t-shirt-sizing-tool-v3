<template>
  <v-tooltip v-model="projektkalkulationStore.explain" v-if="props.node.selected" :open-on-hover="false" location="bottom">
    <template v-slot:activator="{props}">
      <v-icon class="pb-2" icon="mdi-help-circle-outline" v-bind="props"
               @click="clickedIcon()"
               @mouseenter="mouseEnter()"
               @mouseleave="mouseLeave()"
      >
      </v-icon>
    </template>
    <div v-html="projektkalkulationStore.erklaerungsRechnung"></div>
    <div v-html="projektkalkulationStore.erklaerungsRechnungZusatz"></div>
  </v-tooltip>

</template>

<script setup lang="ts">
//TODO Wenn man scrollt, während der Tooltip angezeigt wird, flackert die Tabelle
import {useProjektkalkulationStore} from "@/stores/projektkalkulationContainer";
const props = defineProps(["node","api"]);
const projektkalkulationStore = useProjektkalkulationStore();
function clickedIcon() {
  if(props.api!=undefined) {
    const focusedCell = props.api.getFocusedCell();
    if (focusedCell == null) return;
    const column = focusedCell.column.getColId();
    const rowIndex = focusedCell.rowIndex;
    if (rowIndex != undefined && column != undefined) {
      props.api.getRowNode(rowIndex + "")!.setSelected(true);
      props.api.setFocusedCell(rowIndex, column);
    }
    props.api.refreshCells({ force: true });
  }
  projektkalkulationStore.explain=!projektkalkulationStore.explain
}

function mouseEnter() {
  projektkalkulationStore.colorCells=true
}

function mouseLeave() {
  projektkalkulationStore.clearErklaerungen()
}
</script>

<style scoped>

</style>