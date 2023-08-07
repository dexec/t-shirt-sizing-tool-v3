<template>
<div @contextmenu="rightClick">Right Click</div>
  <context-menu ref="contextMenuRef" :providedFunctionsProp="[]"></context-menu>
  <input ref="input">
</template>

<script setup>
import ContextMenu from "@/components/ContextMenu.vue";
import {onMounted, ref} from "vue";
const input = ref(null)
function rightClick(e) {
  const contextMenuRef = ref(null)

  console.log(contextMenuRef.value)
  console.log(input.value)


}
</script>

