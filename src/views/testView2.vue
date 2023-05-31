<template>
  <div class="row">
    <div class="col-3">
      <h3>Draggable 1</h3>
      <draggable
          class="list-group"
          :list="list1"
          group="people"
          @change="log"
          itemKey="name"
      >
        <template #item="{ element, index }">
          <div class="list-group-item">{{ element.name }} {{ index }}</div>
        </template>
      </draggable>
    </div>

    <div class="col-3">
      <h3>Draggable 2</h3>
      <draggable
          class="list-group"
          :list="list2"
          group="people"
          @change="log"
          itemKey="name"
      >
        <template #item="{ element, index }">
          <div class="list-group-item">{{ element.name }} {{ index }}</div>
        </template>
      </draggable>
    </div>
  </div>
</template>
<script setup lang="ts">
import draggable from "vuedraggable";
import {ref} from "vue";

const list1 = ref( [
  { name: "John", id: 1 },
  { name: "Joao", id: 2 },
  { name: "Jean", id: 3 },
  { name: "Gerard", id: 4 }
])

const list2 = ref([
  { name: "Juan", id: 5 },
  { name: "Edgard", id: 6 },
  { name: "Johnson", id: 7 }
])
function log(evt:Event) {
  console.log(evt)
}
</script>

<style scoped>

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
