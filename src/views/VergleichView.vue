<template>
  <!--  <v-autocomplete v-model="searchedPaket" :items="this.paketeChildren" item-title="ticket_nr" item-value="id"
                    label="Paket suchen" style="position: absolute;left:100px;top:200px; width: 200px"
                    @blur="this.searchedPaket=null"></v-autocomplete>-->
  <!--  <context-menu :provided-functions-prop="[...this.providedFunctions]"></context-menu>-->
  <v-container>
    <v-row class="mb-6">
      <v-col class="d-flex flex-nowrap justify-center">
        <v-btn class="bucketsButton" @click="showPaketeWithoutBucket=!showPaketeWithoutBucket"><span
            class="bucketsButtonText">Toggle
          Arbeitspakete</span></v-btn>
        <v-dialog v-model="dialog" width="auto">
          <template v-slot:activator="{props}">
            <v-btn class="mx-6 bucketsButton" v-bind="props">
              <span class="bucketsButtonText">Buckets konfigurieren</span>
            </v-btn>
          </template>
          <v-card>
            <v-card-text>
              <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :label=bucket.name
                          :value="bucket.id" @change="sortSelectedBuckets()">
              </v-checkbox>
              <div v-if="buckets.length == 0">Es gibt keine Buckets</div>
            </v-card-text>
          </v-card>
        </v-dialog>
        <draggable :list="[]"
                   :style="{visibility: (!showPaketeWithoutBucket || paketeWithoutBucket.length===0 ? 'visible':'hidden')}"
                   class="paket"
                   ghostClass="ghostClass"
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
    <v-row>
      <v-col :style="{visibility: (showPaketeWithoutBucket ? 'visible':'hidden')}" cols="3">
        <v-text-field id="filterForPaketeList" v-model="paketeListeFilter" label="Pakete filtern" clearable @click:clear="paketeListeFilter=''"
                      style="width:200px;"></v-text-field>
        <h2>Unzugewiesene Pakete</h2>
        <draggable
            v-if="paketeWithoutBucket.length>0"
            :list="paketeWithoutBucket"
            :sort="false"
            class="dragArea list-group"
            ghostClass="ghostClass"
            group="pakete"
            itemKey="name"
            style="overflow-y:auto;height: 70vh"
            @change="removePaketFromBucket"
        >
          <template #item="{ element }">
            <div v-if="applyFilter(element,paketeListeFilter)" :title="getTitleForPaket(element)" class="paket ma-2"
                 style="position: relative;">
              <span class="paketContent">{{ (element as Paket).ticket_nr }}</span>
              <span class="paketContent">{{ (element as Paket).thema }}</span>
            </div>
          </template>
        </draggable>
        <span v-if="paketeWithoutBucket.length==0">Es gibt keine Pakete ohne Bucket</span>
      </v-col>
      <v-col>
        <v-row>
          <v-col>
            <v-text-field id="filterForPakete" v-model="paketeTabelleFilter" label="Pakete filtern" clearable @click:clear="paketeTabelleFilter=''"
                          style="width:200px;"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="d-flex flex-nowrap justify-start">
            <div v-for="bucketId of selected" :key="bucketId">
              <div v-if="bucketsAsMap.get(bucketId)" class="list-group">
                <div class="paket ma-2">{{ bucketsAsMap.get(bucketId).name }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row style="height:65vh; overflow-y:auto; overflow-x:hidden;">
          <v-col class="d-flex flex-nowrap justify-start">
            <draggable
                v-for="bucketId of selected" :key="bucketId"
                :list="getPaketeSortedByBucket(bucketsAsMap.get(bucketId)!)"
                class="dragArea list-group"
                group="pakete"
                itemKey="name"
                style="min-height: 100%;"
                @change="changeBucketOfPaket($event,buckets.find(bucket => bucket.id == bucketId)!)"
            >
              <template #item="{ element }">
                <div v-if="applyFilter(element,paketeTabelleFilter)" :title="getTitleForPaket(element)"
                     class="paket ma-2">
                  <span :style="searchPaket(element)" class="list-group-item paketContent">{{
                      (element as Paket).ticket_nr
                    }}</span>
                  <span :style="searchPaket(element)" class="list-group-item  paketContent">{{
                      (element as Paket).thema
                    }}</span>
                </div>
              </template>
            </draggable>
          </v-col>
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
import {useVariablenAustauschStore} from "@/stores/variablenAustausch";

const paketeStore = usePaketeStore();
const bucketStore = useBucketsStore();
const dialog = ref(false);
const unsortedPaketeListsSortedByBucketsMap = paketeStore.unsortedPaketeListsSortedByBucketsMap;
const showPaketeWithoutBucket = ref(true)
const searchedPaket = ref(0);
const paketeWithoutBucket = computed(() => paketeStore.paketeChildrenWithNoBucket())
const buckets = bucketStore.bucketsAsSortedArray as Bucket[];
const bucketsAsMap = bucketStore.bucketsAsMap;
const selected = ref<number[]>(buckets.map(bucket => bucket.id));
onActivated(() => {
  sortSelectedBuckets();
});

function getTitleForPaket(paket: Paket): string {
  let result: string = "";
  const parents = paketeStore.parentsOfPaket(paket).reverse();
  for (const paket of parents) {
    result += paket.thema + "\n";
    for (let i = 0; i < paket.lvl + 1; i++) {
      result += "\t"
    }
  }
  result += paket.thema
  return result
}

const paketeTabelleFilter = ref("");
const paketeListeFilter = ref("");

function applyFilter(paket: Paket, filterString: string): boolean {
  const variablenAustauschStore = useVariablenAustauschStore();
  const paketStringIndexed: { [index: string]: any } = paket
  let searchStringFound = false;
  for (const key in paketStringIndexed) {
    if (typeof paketStringIndexed[key] === "string" &&  paketStringIndexed[key].includes(variablenAustauschStore.searchPaketString)) {
      searchStringFound =  true;
      break;
    }
  }
  if(searchStringFound) {
    for (const key in paketStringIndexed) {
      if (typeof paketStringIndexed[key] === "string" && paketStringIndexed[key].includes(filterString)) {
        return true
      }
    }
  }
  return false
}

function sortSelectedBuckets() {
  const copySelected = [...selected.value]
  selected.value.length = 0
  for (let bucket of buckets) {
    if (copySelected.includes(bucket.id)) {
      selected.value.push(bucket.id)
    }
  }
  copySelected.length = 0
}

/*function getPaketSortedByBucket(bucket: Bucket) {
  const result: Paket[] = [];
  paketeChildren.value.forEach(paket => {
    if (paket.bucket && paket.bucket == bucket) result.push(paket);
  });
  return result;
}*/

function getPaketeSortedByBucket(bucket: Bucket) {
  return unsortedPaketeListsSortedByBucketsMap.get(bucket) as Paket[];
}

function removePaketFromBucket(evt: any) {
  if (evt.added) {
    evt.added.element.bucket = null;
  }
}

function changeBucketOfPaket(evt: any, bucket: Bucket) {
  //TODO Wenn man ein Paket in ein Bucket zieht, soll die Überschrift des Buckets kurz aufleuchten,
  // um zu sehen, in welchem Bucket das Paket landen wird sobald man loslässt
  if (evt.added) {
    const updatePaket = evt.added.element;
    updatePaket.bucket = bucketStore.bucketsAsMap.get(bucket.id);
  }
}

function searchPaket(paket: Paket) {
  if (paket.id === searchedPaket.value) {
    return "border-color: red";
  }
}

function bucketAreaHeight() {
  let scrollHeight = document.getElementById('abc')!.scrollHeight
  console.log(scrollHeight)
  if (scrollHeight) return 'height: ' + scrollHeight
  else return 0;
}

function rootParentThemaOfPaket(paket: Paket): string {
  const result = paketeStore.rootParentOfPaket(paket);
  if (result) return result.thema;
  else return paket.thema;
}

function onStartDrag(e: any) {
  const tooltips = document.getElementsByClassName("tooltip");
  console.log(e);
  for (const tooltip of tooltips) {
    const tooltiptexts = tooltip.getElementsByClassName("tooltiptext");
    for (const tooltiptext of tooltiptexts) {
      const htmlElement = tooltiptext as HTMLElement;
      htmlElement.style.visibility = "hidden";
    }
  }
}

function onEndDrag(e: any) {
  const tooltips = document.getElementsByClassName("tooltiptext");
  console.log(e);
  /*for(const element of tooltips) {
    const htmlElement = element as HTMLElement
    htmlElement.style.visibility="visible"
  }*/
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
  /*min-height: 250px;*/
}

.ghostClass {
  display: none;
}
</style>