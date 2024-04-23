<template>
  <v-tooltip v-model="projektkalkulationStore.explain" v-if="props.node.selected" :open-on-hover="false">
    <template v-slot:activator="{props}">
      <v-icon icon="mdi-help" v-bind="props"
               @click="projektkalkulationStore.explain=!projektkalkulationStore.explain"
               @mouseenter="projektkalkulationStore.colorCells=true"
               @mouseleave="projektkalkulationStore.colorCells=false; projektkalkulationStore.explain=false;">
      </v-icon>
    </template>
    <div v-html="projektkalkulationStore.erklaerungsRechnung"></div>
    <div v-html="projektkalkulationStore.erklaerungsRechnungZusatz"></div>
  </v-tooltip>
</template>

<script setup lang="ts">
import {useProjektkalkulationStore} from "@/stores/projektkalkulation";
const props = defineProps(["node"]);
const projektkalkulationStore = useProjektkalkulationStore();
</script>

<style scoped>

</style>