<template>
  <v-container fluid>
    <v-row>
      <v-col class="align-self-start" :style="{visibility: (showPaketeWithoutBucket ? 'visible':'hidden')}" cols="2">
        <v-text-field id="filterForPaketeList" class="filterClass" v-model="paketeListeFilter" clearable placeholder="Pakete filtern"
                      @click:clear="paketeListeFilter=''"></v-text-field>
        <draggable
          id="paketeWithoutBucketList"
          :group="{name: 'pakete', pull:true,put:true}"
          :list="paketeWithoutBucket"
          :sort="false"
          chosen-class="redBorder"
          class="dragArea"
          drag-class="dragClass"
          ghost-class="ghostClass"
          itemKey="name"
          @change="removePaketFromBucket"
          @end="endDrag"
          @start="startDrag"
        >
          <template #item="{ element }">
            <div v-if="applyFilter(element,paketeListeFilter)" :title="getTitleForPaket(element)" class="paket"
                 style="position: relative;">
              <span class="paketContent">{{ (element as Paket).ticket_nr }}</span>
              <span class="paketContent">{{ (element as Paket).thema }}</span>
            </div>
          </template>
        </draggable>
      </v-col>
      <v-col cols="10">
        <v-text-field id="filterForPakete" class="filterClass" v-model="paketeTabelleFilter" clearable placeholder="Pakete filtern"
                      @click:clear="paketeTabelleFilter=''"></v-text-field>
        <v-row style="margin-bottom: -30px">
          <v-col class="d-flex flex-nowrap justify-start">
            <div v-for="bucketId of selected" :key="bucketId">
              <div v-if="bucketsAsMap.get(bucketId)" class="list-group">
                <div class="paketHeader">{{ bucketsAsMap.get(bucketId)?.name }}</div>
              </div>
            </div>
          </v-col>
        </v-row>
        <v-row style="height:70vh; overflow-y:auto; overflow-x:hidden; ">
          <v-col class="d-flex flex-nowrap justify-start">
            <draggable
              v-for="bucketId of selected" :key="bucketId"
              :list="getPaketeSortedByBucket(bucketsAsMap.get(bucketId) as Bucket)"
              class="dragArea list-group paketeInBucketList"
              ghost-class="ghostClass"
              drag-class="dragClass"
              group="pakete"
              itemKey="name"
              @change="changeBucketOfPaket($event,buckets.find(bucket => bucket.id == bucketId)!)"
              @end="endDrag"
              @start="startDrag"
            >
              <template #item="{ element }">
                <div v-if="applyFilter(element, paketeTabelleFilter)" :title="getTitleForPaket(element)"
                     class="paket">
                  <span :style="searchPaket(element)" class="list-group-item paketContent">
                    {{ (element as Paket).ticket_nr }}
                  </span>
                  <span :style="searchPaket(element)" class="list-group-item paketContent">
                    {{ (element as Paket).thema }}
                  </span>
                </div>
              </template>
            </draggable>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="dialog" width="auto">
    <template v-slot:activator="{props}">
      <v-btn class="mx-6 configBucketsButton clickable-element" v-bind="props">
        <span class="bucketsButtonText">Konfig</span>
      </v-btn>
    </template>
    <v-card style="width: 15vw">
      <v-card-text class="d-flex flex-column justify-center align-center">
        <span>{{ selected.length }}/{{ numberBucketsToShow }}</span>
        <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :disabled="numberBucketsToShow==selected.length && !selected.includes(bucket.id)"
                    :label=bucket.name
                    :value="bucket.id" @change="sortSelectedBuckets()">
        </v-checkbox>
        <div v-if="buckets.length == 0">Es gibt keine Buckets</div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts" setup>
import { usePaketContainer } from "@/stores/paketContainer";
import { useBucketContainer } from "@/stores/bucketContainer";
import { computed, nextTick, onUnmounted, ref } from "vue";
import { Bucket } from "@/models/Bucket";
import { Paket } from "@/models/Paket";
import draggable from "vuedraggable";
import "@/styles/hoverLink.css";
import { useVergleicheStore } from "@/stores/vergleiche";

const paketContainer = usePaketContainer();
const bucketContainer = useBucketContainer();

const dialog = ref(false);
const unsortedPaketeListsSortedByBucketsMap = paketContainer.unsortedPaketeListsSortedByBucketsMap;
const showPaketeWithoutBucket = ref(true);
const searchedPaket = ref(0);
const paketeWithoutBucket = computed(() => paketContainer.paketeChildrenWithNoBucket());
const buckets = bucketContainer.bucketsAsSortedArray as Bucket[];
const bucketsAsMap = bucketContainer.bucketsAsMap;

const vergleichStore = useVergleicheStore();
const numberBucketsToShow = ref(4);
const selected = ref<number[]>(vergleichStore.checkboxSelectedIds);

nextTick(() => {
  setNumberBucketsToShow();
  sortSelectedBuckets();
});

function startDrag() {
  const paketeWithoutBucketList = document.getElementById("paketeWithoutBucketList");
  const paketeInBucketLists = document.getElementsByClassName("paketeInBucketList");
  if (paketeWithoutBucketList) paketeWithoutBucketList.style.border = "1px dotted red";
  for (let i = 0; i < paketeInBucketLists.length; i++) {
    const paketeInBucketList = paketeInBucketLists[i] as HTMLElement;
    paketeInBucketList.style.border = "1px dotted red";
  }
}

function endDrag() {
  const paketeWithoutBucketList = document.getElementById("paketeWithoutBucketList");
  const paketeInBucketList = document.getElementsByClassName("paketeInBucketList");
  if (paketeWithoutBucketList) paketeWithoutBucketList.style.border = "1px solid black";
  for (let i = 0; i < paketeInBucketList.length; i++) {
    const htmlelement = paketeInBucketList[i] as HTMLElement;
    htmlelement.style.border = "1px solid transparent";
  }
}

function setNumberBucketsToShow() {
  const clientWidth = window.screen.width;
  if (clientWidth != null) {
    const bucketTableWidth = clientWidth * 0.82;
    numberBucketsToShow.value = Math.trunc(bucketTableWidth / 200);
    while (selected.value.length > numberBucketsToShow.value) {
      selected.value.pop();
    }
  }
}

function sortSelectedBuckets() {
  const copySelected = [...selected.value];
  selected.value.length = 0;
  for (let bucket of buckets) {
    if (copySelected.includes(bucket.id)) {
      selected.value.push(bucket.id);
    }
  }
  copySelected.length = 0;
}

onUnmounted(() => vergleichStore.checkboxSelectedIds.splice(0, vergleichStore.checkboxSelectedIds.length, ...selected.value));
window.addEventListener("resize", function() {
  dialog.value = false;
  setNumberBucketsToShow();
});

function getTitleForPaket(paket: Paket): string {
  let result: string = "";
  const parents = paketContainer.parentsOfPaket(paket).reverse();
  for (const paket of parents) {
    result += paket.ticket_nr + " " + paket.thema + "\n";
    for (let i = 0; i < paket.lvl + 1; i++) {
      result += "\t";
    }
  }
  result += paket.ticket_nr + " " + paket.thema;
  return result;
}

const paketeTabelleFilter = ref("");
const paketeListeFilter = ref("");

function applyFilter(paket: Paket, filterString: string): boolean {
  const paketStringIndexed: { [index: string]: any } = paket;
  for (const key in paketStringIndexed) {
    if (typeof paketStringIndexed[key] === "string" && paketStringIndexed[key].toUpperCase().includes(filterString.toUpperCase())) {
      return true;
    }
  }
  return false;
}

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
    updatePaket.bucket = bucketContainer.bucketsAsMap.get(bucket.id);
  }
}

function searchPaket(paket: Paket) {
  if (paket.id === searchedPaket.value) {
    return "border-color: red";
  }
}

/*

function rootParentThemaOfPaket(paket: Paket): string {
  const result = paketContainer.rootParentOfPaket(paket);
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
  /!*for(const element of tooltips) {
    const htmlElement = element as HTMLElement
    htmlElement.style.visibility="visible"
  }*!/
}*/
</script>

<style scoped>
.configBucketsButton {
  position: fixed;
  top: 10vh;
  right: 10vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 50px;
}

.bucketsButtonText {
  text-align: center;
  white-space: pre-wrap;
  color: white
}

.paket {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 100px;
  min-height: 100px;
  border: 1px solid #000;
  margin: 24px;
  cursor: grab;
}

.paketHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 150px;
  height: 50px;
  min-height: 50px;
  border: 1px solid #000;
  margin: 24px;
}

.paketContent {
  text-align: center;
}

.list-group {
  width: 200px;
}

.dragClass {
  opacity: 30%;
  border: 3px red solid;
  color: transparent;

}

.ghostClass {
  border: 3px red solid;
}

.greenBorder {
  opacity: 20%;
  border: 3px green solid;
}

.blueBorder {
  border: 3px blue solid;
}

.paketeInBucketList {
  min-height: 100%;
  border: 1px transparent solid;
}

#paketeWithoutBucketList {
  overflow-y: auto;
  height: 75vh;
  border: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.filterClass {
  width:150px;
  height: 80px;
  margin-left:24px
}
</style>