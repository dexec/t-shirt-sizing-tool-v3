<template>
  <div class="d-flex">
    <draggable
        :list="getPakete()"
        class="dragArea list-group"
        group="pakete"
        itemKey="name"
        style="height: 90vh"
    >
      <template #item="{ element }">
        <div class="paket ma-2">
        <span class="list-group-item paketContent">#{{
            (element as Paket).ticket_nr
          }}</span>
          <span class="list-group-item  paketContent">{{
              (element as Paket).thema
            }}</span>
        </div>
      </template>
    </draggable>
    <draggable
        :list="getPakete()"
        class="dragArea list-group"
        group="pakete"
        itemKey="name"
        ghostClass="ghostClass"
        style="height: 90vh"
    >
      <template #item="{ element }">
        <div class="paket ma-2">
        <span class="list-group-item paketContent">#{{
            (element as Paket).ticket_nr
          }}</span>
          <span class="list-group-item  paketContent">{{
              (element as Paket).thema
            }}</span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script lang="ts" setup>
import {Paket} from "@/Paket";
import {usePaketeStore} from "@/stores/pakete";
import {useBucketsStore} from "@/stores/buckets";
import {computed, ref} from "vue";
import draggable from "vuedraggable";

const paketeStore = usePaketeStore();
const bucketStore = useBucketsStore();
const dialog = ref(false);
const checked = ref(false);
const showPaketeWithoutBucket = ref(true);
const paketeWithoutBucket = computed(() => paketeStore.paketeChildrenWithNoBucket());
const paketeChildren = computed(() => paketeStore.paketeChildren());
const unsortedPaketeListsSortedByBucketsMap = paketeStore.unsortedPaketeListsSortedByBucketsMap;
const searchedPaket = ref(0);

function getPakete() {
  return paketeStore.paketeAsFlatView();
}
</script>

<style scoped>
.bucketsButton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px; /* Adjust the width as needed */
  height: 100px; /* Adjust the height as needed */
}

.bucketsButtonText {
  text-align: center;
  white-space: pre-wrap;
}

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

.destination-item {
  display: none;
}

.ghostClass {
  display: none;
}
</style>