<template>
  <div class="wrapper">
    <v-list class="my-1 py-1" density="compact">
      <v-list-item v-for="providedFunction of providedFunctions" :key="providedFunctions.indexOf(providedFunction)"
                   density="compact" @click="providedFunction.function">
        <span v-if="providedFunction.icon" class="item">
          <v-icon size="x-small">
            {{ providedFunction.icon }}
          </v-icon>
        </span>
        <span v-else class="item">
          {{ providedFunction.functionLabel }}
        </span>
      </v-list-item>
    </v-list>
    <!--      <div class="menu">

            <div v-for="providedFunction of providedFunctions" :key="providedFunctions.indexOf(providedFunction)"
                 @click="providedFunction.function">
              <span v-if="providedFunction.icon" class="item">
                <v-icon size="x-small">{{ providedFunction.icon }}</v-icon>
              </span>
              <span v-else class="item">{{ providedFunction.functionLabel }}</span>
            </div>
          </div> -->

  </div>
</template>

<script lang="ts" setup>
import type { Ref } from "vue";
import { inject, ref } from "vue";

const props = defineProps(["providedFunctionsProp"]);
const providedFunctions: Ref<Array<{
  functionLabel: string,
  functionName: string,
  function: Function,
  icon: string
}>> = ref([]);
for (let providedFunctionProp of props.providedFunctionsProp) {
  const providedFunction = inject(providedFunctionProp.functionName);

  if (typeof providedFunction === "function") providedFunctions.value.push({
    functionLabel: providedFunctionProp.functionLabel,
    functionName: providedFunctionProp.functionName,
    function: providedFunction,
    icon: providedFunctionProp.icon
  });
}

function showMenu(e: any) {
  e.preventDefault();
  const contextMenu = document.querySelector(".wrapper") as HTMLElement;
  let x = e.clientX;
  let y = e.clientY;
  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.style.display = "block";
  document.addEventListener("click", () => contextMenu.style.display = "none");
}

defineExpose({ showMenu });

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

/*
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
}*/

</style>
