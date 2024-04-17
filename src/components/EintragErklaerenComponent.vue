<template>
    <v-tooltip location="bottom">
      <div v-for="erklaerung of erklaerungen" :key="erklaerungen.indexOf(erklaerung)">
        {{erklaerung}}
      </div>
<!--      <div v-html="erklaerungsText"></div>
      <div v-if="erklaerungsTextZusatz!=''" v-html="erklaerungsTextZusatz"></div>
      <div v-html="erklaerungsRechnung"></div>
      <div v-if="erklaerungsRechnungZusatz!=''" v-html="erklaerungsRechnungZusatz"></div>-->
    </v-tooltip>
<!--  <template #activator="{props}">
    <v-btn v-bind="props">Test</v-btn>Test
  </template>-->
</template>

<script setup lang="ts">
const props = defineProps(["erklaerungen"]);
</script>

<style scoped>

</style>