
<template>
{{count}}
  <v-btn @click="counter"></v-btn>
</template>

<script lang="ts" setup>
import {ref} from "vue";

const count = ref(0);
function counter() {
  count.value++;
}
</script>

<style scoped>
.container {
  height: calc(100vh - 64px); /* Set the container height to match the viewport */
  overflow: scroll; /* Enable scrolling when content overflows */
}

</style>
