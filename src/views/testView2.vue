<template>
  <div style="width: 500px; height: 500px; border: 1px solid black" @click="clickedDiv">
    <input ref="currentEditInput" autofocus style="width: 200px; height: 100px; border:1px solid black" type="text">
  </div>
</template>

<style scoped>

</style>

<script lang="ts" setup>

import { ref } from "vue";

const currentEditInput = ref<HTMLElement|null>(null)

function clickedDiv() {
currentEditInput?.value?.focus();
}
</script>