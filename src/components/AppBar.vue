<template>
  <v-app-bar color="#03787c" flat>
<!--    TODO Icon einbauen-->
    <v-tabs>
      <v-tab style="color: white" to="/projekt">Projektübersicht</v-tab>
      <v-tab style="color: white" to="/pakete">Paketübersicht</v-tab>
      <v-tab style="color: white" v-if="projektStore.bucketmodus" to="/vergleich">Vergleich</v-tab>
      <v-tab style="color: white" to="/buckets">Bucketübersicht</v-tab>
      <v-tab style="color: white" to="/kalkulation">Projektkalkulation</v-tab>
      <v-tab style="color: white" to="/test">Test</v-tab>
      <v-tab style="color: white" to="/test2">Test2</v-tab>
    </v-tabs>
  </v-app-bar>
</template>
<style scoped>

</style>
<script setup>
  import {useProjektStore} from "@/stores/projekt";
  const projektStore = useProjektStore();

</script>
