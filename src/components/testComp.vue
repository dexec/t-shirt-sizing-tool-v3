<template>
  <div ref="reftodiv" class="container" @keyup.enter="handle"></div>
</template>

<script lang="ts" setup>
import { nextTick, onMounted, ref } from "vue";

const reftodiv = ref<HTMLDivElement | null>(null);

reftodiv.value?.addEventListener("keyup",handle)
onMounted(() => nextTick(() => reftodiv.value?.focus()));
function handle() {
  console.log("enteredSubComp");
}
</script>


<style scoped>
.container {
  width: 400px;
  height: 400px;
  border: black solid 2px;
}
</style>