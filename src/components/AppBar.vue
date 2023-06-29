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
  </v-app-bar>
</template>

<script setup>
  import {useProjektStore} from "@/stores/projekt";
  const projektStore = useProjektStore();
</script>
