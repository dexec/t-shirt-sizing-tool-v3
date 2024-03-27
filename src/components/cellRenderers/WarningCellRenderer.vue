<template>
  <div v-if="rowsUpdated"><v-icon icon="mdi-alert "></v-icon></div>
  <div v-else>abc</div>
</template>

<script setup lang="ts">
const props = defineProps(['params']);
  let rowsUpdated:boolean = false;
    let count = 0;
    props.params.api.forEachNode(() => {
      count++;
    })
    rowsUpdated = count >=5;
</script>

<style scoped>

</style>