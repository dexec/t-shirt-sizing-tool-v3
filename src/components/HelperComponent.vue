
<template>
  <div id="container">
    <div v-for="entry of entriesProp" :key="entriesProp.indexOf(entry)">
      {{entry}}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps(["entriesProp"]);
</script>


<style scoped>
#container {
  position: fixed;
  height: 300px;
  top: 100px;
  right: 20px;
  background-color: #8ee774;
  z-index: 5;
}
</style>