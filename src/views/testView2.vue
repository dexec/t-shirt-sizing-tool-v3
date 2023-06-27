<template>
    <draggable
        style="overflow-y:scroll;height: 75vh"
        :list="list"
        class="dragArea list-group ma-2"
        ghost-class="destination-item"
        group="pakete"
        itemKey="name"
        :sort="false"
    >
      <template #header>
        <div class="paket ma-2" style="position: fixed">Überschrift</div>
      </template>
      <template #item="{ element }">
          <div class="paket ma-2">
            <span  class="list-group-item  paketContent">{{
                element
              }}
            </span>
          </div>
      </template>
    </draggable>
</template>

<script lang="ts" setup>
import draggable from "vuedraggable";
import {ref} from "vue";
const list=ref<number[]>([])
for(let i =0; i<1000;i++) list.value.push(i)
</script>
<style scoped>
.paket {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px; /* Adjust the width as needed */
  height: 100px; /* Adjust the height as needed */
  min-height: 100px;
  border: 1px solid #000; /* Optional: Add a border for the box */
}

.paketContent {
  text-align: center;
}

.list-group {
  width: 200px;
  min-height: 250px;
}
</style>
