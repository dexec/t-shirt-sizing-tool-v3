<template>
  <!--  <v-autocomplete v-model="searchedPaket" :items="this.paketeChildren" item-title="ticket_nr" item-value="id"
                    label="Paket suchen" style="position: absolute;left:100px;top:200px; width: 200px"
                    @blur="this.searchedPaket=null"></v-autocomplete>-->
  <!--  <context-menu :provided-functions-prop="[...this.providedFunctions]"></context-menu>-->
  <v-container>
    <v-row>
      <v-col cols="3">
        <v-row id="rowBucketsButtonAndTrash">
          <v-col cols="6">
            <v-dialog v-model="dialog" width="auto">
              <template v-slot:activator="{props}">
                <v-btn class="mb-6 bucketsButton" v-bind="props"><span
                    class="bucketsButtonText">Buckets konfigurieren</span></v-btn>
              </template>
              <v-card>
                <v-card-text>
                  <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :label=bucket.name
                              :value="bucket.id" @change="sortSelectedBuckets">
                  </v-checkbox>
                  <div v-if="buckets.length===0">Es gibt keine Buckets</div>
                </v-card-text>
              </v-card>
            </v-dialog>
          </v-col>
          <v-col cols="6">
            <draggable
                :list="[]"
                class="paket"
                ghostClass="destination-item"
                group="pakete"
                itemKey="name"
                @change="removePaketFromBucket"
            >
              <template #header>
                <v-icon icon="mdi-trash-can"></v-icon>
              </template>
              <template #item="{  }">
              </template>
            </draggable>
          </v-col>
        </v-row>
        <v-col>
          <h2>Arbeitspakete ohne Bucket</h2>
          <draggable
              v-if="paketeWithoutBucket.length>0"
              id="draggablePaketWithoutBucket"
              :list="paketeWithoutBucket"
              class="dragArea list-group"
              ghostClass="destination-item"
              group="pakete"
              itemKey="name"
              style="overflow-y:scroll;height: 70vh"
              @change="removePaketFromBucket"
          >
            <template #item="{ element }">
              <div class="paket ma-2">
                <span class="paketContent">#{{ (element as Paket).ticket_nr }}</span>
                <span class="paketContent">{{ (element as Paket).thema }}</span>
              </div>
            </template>
          </draggable>
          <span v-if="paketeWithoutBucket.length===0">Es gibt keine Pakete ohne Bucket</span>
        </v-col>
      </v-col>
      <v-col class="d-flex flex-column" cols="9">
        <v-row class="d-flex flex-nowrap justify-center">
          <div v-for="bucket in buckets" :key="bucket.id">
            <draggable
                v-if="selected.includes(bucket.id)"
                :list="getPaketSortedByBucket(bucket as Bucket)"
                class="dragArea list-group ma-2"
                ghost-class="destination-item"
                group="pakete"
                itemKey="name"
                @change="changeBucketOfPaket($event,bucket as Bucket)"
            >
              <template #header>
                <div class="paket ma-2">{{ bucket.name }}</div>
              </template>
              <template #item="{ element }">
                <div class="paket ma-2">
                  <span :style="searchPaket(element)" class="list-group-item paketContent">#{{
                      (element as Paket).ticket_nr
                    }}</span>
                  <span :style="searchPaket(element)" class="list-group-item  paketContent">{{
                      (element as Paket).thema
                    }}</span>
                </div>
              </template>
            </draggable>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import {usePaketeStore} from "@/stores/pakete";
import {useBucketsStore} from "@/stores/buckets";
import {computed, onActivated, ref} from "vue";
import {Bucket} from "@/Bucket";
import {Paket} from "@/Paket";
import draggable from "vuedraggable";

const paketeStore = usePaketeStore();
const bucketStore = useBucketsStore();
const dialog = ref(false);
const checked = ref(false);
const buckets = bucketStore.buckets;
const paketeWithoutBucket = computed(() => paketeStore.paketeChildrenWithNoBucket())
const paketeChildren = computed(() => paketeStore.paketeChildren())
const searchedPaket = ref(0)
const selected = ref<number[]>(buckets.map(bucket => bucket.id))
onActivated(() => {
  for(let bucketID of selected.value) {
    if(!buckets.map(bucket => bucket.id).includes(bucketID)) {
      selected.value.splice(selected.value.indexOf(bucketID),1);
    }
  }
})


/*onMounted(() => {
  let rowBucketsButtonAndTrash = document.getElementById("rowBucketsButtonAndTrash");
  let draggablePaketWithoutBucket = document.getElementById("draggablePaketWithoutBucket")
  if(rowBucketsButtonAndTrash && draggablePaketWithoutBucket) {
    let rowBucketsButtonAndTrashHeight = rowBucketsButtonAndTrash.offsetHeight;
    console.log(rowBucketsButtonAndTrashHeight)
    let draggablePaketWithoutBucketHeight = window.outerHeight-rowBucketsButtonAndTrashHeight-64
    draggablePaketWithoutBucket.style.height=draggablePaketWithoutBucketHeight+"px";
    draggablePaketWithoutBucket.style.overflowY="scroll";
    console.log(draggablePaketWithoutBucket.style.height)
  }
})*/

function sortSelectedBuckets() {
  selected.value.sort(function (a, b) {
    return a - b
  })
}

function getPaketSortedByBucket(bucket: Bucket) {
  const result: Paket[] = [];
  paketeChildren.value.forEach(paket => {
    if (paket.bucket && paket.bucket == bucket) result.push(paket)
  })
  return result
}

function removePaketFromBucket(evt: any) {
  if (evt.added) {
    evt.added.element.bucket = null
  }
}

function changeBucketOfPaket(evt: any, bucket: Bucket) {
  if (evt.added) {
    const updatePaket = evt.added.element
    updatePaket.bucket = bucketStore.buckets.find(currentBucket => currentBucket == bucket)
  }
}

function searchPaket(paket: Paket) {
  if (paket.id === searchedPaket.value) {
    return "border-color: red"
  }
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


</style>