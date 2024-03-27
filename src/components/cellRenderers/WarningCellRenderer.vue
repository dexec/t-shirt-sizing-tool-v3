<template>
  <v-icon icon="mdi-alert "></v-icon>
</template>

<script setup lang="ts">
  const props = defineProps(['params']);
  console.log(props.params.gridApi);
</script>

<style scoped>

</style>