<template>
  <v-app-bar color="blue" flat>
    <v-tabs>
      <v-tab to="/projekt">Projektübersicht</v-tab>
      <v-tab to="/pakete">Paketübersicht</v-tab>
      <v-tab v-if="projektStore.bucketmodus" to="/vergleich">Vergleich</v-tab>
      <v-tab to="/buckets">Bucketübersicht</v-tab>
      <v-tab to="/kalkulation">Projektkalkulation</v-tab>
      <v-tab to="/test2">Test2</v-tab>
    </v-tabs>
    <v-text-field style="width:200px; position: absolute; right: 10px" v-model="variablenAustauschStore.searchPaketString" clearable @click:clear="variablenAustauschStore.searchPaketString=''" label="Pakete filtern"></v-text-field>
  </v-app-bar>
</template>

<script setup>
  import {useProjektStore} from "@/stores/projekt";
  import {useVariablenAustauschStore} from "@/stores/variablenAustausch";
  const projektStore = useProjektStore();
  const variablenAustauschStore = useVariablenAustauschStore();

</script>
