<template>
  <div class="wrapper">
    <div class="content">
      <div class="menu">
        <div v-for="providedFunction of providedFunctions" :key="providedFunctions.indexOf(providedFunction)"
             @click="providedFunction.function">
          <span class="item" v-if="providedFunction.icon">
            <v-icon size="x-small">{{ providedFunction.icon }}</v-icon>
          </span>
          <span class="item" v-else>{{ providedFunction.functionLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from "vue";
import { inject, ref } from "vue";

const props = defineProps(['providedFunctionsProp'])
const providedFunctions: Ref<Array<{functionLabel:string, functionName:string,function:Function,icon:string}>> = ref([])
for (let providedFunctionProp of props.providedFunctionsProp) {
  const providedFunction = inject(providedFunctionProp.functionName);

  if (typeof providedFunction === 'function') providedFunctions.value.push({
    functionLabel: providedFunctionProp.functionLabel,
    functionName: providedFunctionProp.functionName,
    function: providedFunction,
    icon: providedFunctionProp.icon
  })
}
function showMenu(e) {
  e.preventDefault();
  const contextMenu = document.querySelector(".wrapper") as HTMLElement
  let x = e.clientX
  let y = e.clientY
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.display = "block";
  //TODO Beim Klick soll der Fokus zurück auf Tabelle gehen
  document.addEventListener("click", () => contextMenu.style.display = "none");
}
  defineExpose({showMenu})

</script>

<style scoped>
.wrapper {
  display: none;
  position: absolute;
  width: 280px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.wrapper .menu {
  padding: 10px 12px;
}

.content .item {
  list-style: none;
  height: 20px;
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  border-radius: 5px;
  margin-bottom: 2px;
  padding: 0 5px 0 10px;
  font-size: 0.8rem;
}

.content .item:hover {
  background: #f2f2f2;
}

</style>
