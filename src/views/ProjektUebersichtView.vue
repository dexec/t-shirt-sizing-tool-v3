<template>
  <div class="d-flex flex-column justify-center ma-10">
    <h1>Konfiguration</h1>
    <v-text-field v-model="projektStore.projektname" label="Projektname" outlined solo
                  style="width:20vw"></v-text-field>
    <v-text-field v-model.number="nachkommastellen" label="Nachkommastellen" style="width:20vw"
                  @blur="convertNachkommastelle"></v-text-field>
    <label class="switch">
      <input id="toggleSwitch" v-model="projektStore.bucketmodus" checked type="checkbox">
      <span class="slider"></span>
      <span class="text">Buckets aktivieren</span>
    </label>
<!--    TODO Aufschläge erklären konfig programmieren-->
    <label class="switch">
      <input id="toggleSwitch" v-model="projektStore.bucketmodus" checked type="checkbox">
      <span class="slider"></span>
      <span class="text">Aufschläge erklären</span>
    </label>
    <div>
      <h2 v-if="projektStore.bucketmodus">Buckets</h2>
      <div v-if="projektStore.bucketmodus" class="d-flex flex-wrap" style="height: 100%; width: 100%">
        <div v-for="(bucket,index) in bucketStore.bucketsAsSortedArray" :key="bucket.id">
          <v-container class="mb-4" style="width: 300px;height: 150px">
            <v-row>
              <v-col>
                <v-btn :style="showButtons(bucket as Bucket)" class="mb-4 button" @click="addNewBucketBefore()">
                  <v-icon icon="mdi-plus"></v-icon>
                </v-btn>
                <v-btn :disabled="( index==0 )" :style="showArrowLeft(bucket as Bucket)" class="button"
                       @click="swapWithBucketBefore()">
                  <v-icon icon="mdi-arrow-left"></v-icon>
                </v-btn>
              </v-col>
              <v-col>
                <div v-if="currentEditBucket!==bucket.id" :style="bucketStyle(bucket as Bucket)"
                     class="bucket"
                     @click="currentSelectedBucket=bucket.id"
                     @dblclick="onDoubleClickedBucket(bucket as Bucket)">
                  {{ bucket.name }}
                </div>
                <div v-else class="bucketEdit">
                  <!--                  <input id="textfield" v-model="newBucketName" autofocus type="text" @blur="clearData()"
                                           @focus="$event.target.select()"
                                           @keydown="editBucket">-->
                  <input id="currentEditBucket" v-model="newBucketName" autofocus
                         style="width: 80px;text-align: center; line-height: 80px; height: 80px;"
                         type="text"
                         @blur="clearData()"
                         @keydown="editBucket">
                </div>
              </v-col>
              <v-col>
                <v-btn :style="showButtons(bucket as Bucket)" class="mb-4 button" @click="addNewBucketAfter()">
                  <v-icon icon="mdi-plus"></v-icon>
                </v-btn>
                <v-btn :disabled="!(index < bucketStore.bucketsAsSortedArray.length - 1)"
                       :style="showArrowRight(bucket as Bucket)"
                       class="button" @click="swapWithBucketAfter()">
                  <v-icon icon="mdi-arrow-right"></v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col class="d-flex justify-center">
                <v-btn :style="showButtons(bucket as Bucket)" class="button" @click="attemptDeleteBucket()">
                  <v-icon icon="mdi-minus"></v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </div>
        <div v-if="bucketStore.bucketsAsSortedArray.length===0">
          <v-btn @click="addFirstBucket()">
            <v-icon icon="mdi-plus"></v-icon>
          </v-btn>
        </div>
      </div>
    </div>

  <h1>Downloads</h1>
  <v-btn class="my-5 clickable-element" style="width: 20vw" @click="downloadProject"><span style="color: white">Projekt speichern</span>
  </v-btn>
  <v-btn class="my-5 clickable-element" style="width: 20vw" @click="downloadExcel"><span style="color: white">Excel-Sheet runterladen</span>
  </v-btn>
  </div>
  <ConfirmDialog v-model="showDialog" @cancel="cancelDeleteBucket" @confirm="deleteBucket">
    <template #question>Möchten Sie das Bucket wirklich löschen?</template>
    <template #confirmText>Bestätigen</template>
    <template #cancelText>Abbrechen</template>
  </ConfirmDialog>
</template>

<script lang="ts" setup>
import { useBucketsStore } from "@/stores/buckets";
import { useProjektStore } from "@/stores/projekt";
import { ref } from "vue";
import type { Bucket } from "@/models/Bucket";
import { ExportProject } from "@/components/ExportProject";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { useToast } from "vue-toastification";
import {
  errorToastBucketDuplicateName,
  errorToastBucketEmptyName,
  successToastBucketAdded,
  successToastBucketDeleted,
  successToastBucketsSwapped
} from "@/models/Toasts";
import { ExportAsExcel } from "@/components/ExportAsExcel";

const newBucketName = ref("");
const currentSelectedBucket = ref(-1);
const currentEditBucket = ref(-1);
const bucketStore = useBucketsStore();
const projektStore = useProjektStore();
const toast = useToast();

const showDialog = ref(false);
const currentEditBucketRef = ref<HTMLElement | null>(null);

function cancelDeleteBucket() {

}

function bucketStyle(bucket: Bucket): string {
  return bucket.id == currentSelectedBucket.value ? "background-color: #03787c; color: white" : "";
}

function onDoubleClickedBucket(bucket: Bucket) {
  currentEditBucket.value = bucket.id;
  newBucketName.value = bucket.name;
  currentEditBucketRef.value?.focus();
}

function attemptDeleteBucket() {
  showDialog.value = true;
}

function log() {
  console.log("click");
}

function showButtons(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value == -1) return "";
  else return "visibility: hidden";
}

function showArrowLeft(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value === -1) return "";
  else return "display: none";
}

function showArrowRight(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value === -1) return "";
  else {
    return "display: none";
  }
}

function swapWithBucketBefore() {
  bucketStore.swapWithBucket(currentSelectedBucket.value, true);
  successToastBucketsSwapped();
}

function swapWithBucketAfter() {
  bucketStore.swapWithBucket(currentSelectedBucket.value, false);
  successToastBucketsSwapped();
}

function addFirstBucket() {
  const newBucket = bucketStore.addNewBucket(0, true);
  currentEditBucket.value = newBucket.id;
  newBucketName.value = newBucket.name;
  successToastBucketAdded();
}

function addNewBucketBefore() {
  const newBucket = bucketStore.addNewBucket(currentSelectedBucket.value, true);
  currentEditBucket.value = newBucket.id;
  newBucketName.value = newBucket.name;
  successToastBucketAdded();
}

function addNewBucketAfter() {
  const newBucket = bucketStore.addNewBucket(currentSelectedBucket.value, false);
  currentEditBucket.value = newBucket.id;
  newBucketName.value = newBucket.name;
  successToastBucketAdded();
}

function editBucket(e: KeyboardEvent) {
  if (e.key == "Enter") {
    if (newBucketName.value == "") {
      errorToastBucketEmptyName();
    } else {
      const foundBucket = bucketStore.bucketsAsSortedArray.find(bucket => bucket.name == newBucketName.value);
      if (foundBucket != undefined && foundBucket.id != currentEditBucket.value) {
        errorToastBucketDuplicateName(newBucketName.value);
      } else {
        bucketStore.updateBucketName(currentEditBucket.value, newBucketName.value);
        currentEditBucketRef.value?.blur();
        clearData();
      }
    }
  } else if (e.key == "Escape") {
    currentEditBucketRef.value?.blur();
  }
}

function deleteBucket() {
  const name = bucketStore.bucketsAsMap.get(currentSelectedBucket.value)?.name;
  bucketStore.deleteBucket(currentSelectedBucket.value);
  clearData();
  successToastBucketDeleted(name ?? "");
}

function clearData() {
  newBucketName.value = "";
  currentSelectedBucket.value = -1;
  currentEditBucket.value = -1;
  console.log("cleared");
}

function downloadProject() {
  const exportProject = new ExportProject();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(exportProject.createFile());
  link.download = "test";

  // Simulate a click on the link
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true
  });
  link.dispatchEvent(clickEvent);
}

function downloadExcel() {
  new ExportAsExcel().downloadExcelSheet();
}

const nachkommastellen = ref(2);

function convertNachkommastelle() {
  if (!isNaN(parseFloat(nachkommastellen.value.toString()))) {
    projektStore.nachkommastellen = Math.floor(nachkommastellen.value);
  } else projektStore.nachkommastellen = nachkommastellen.value = 0;
}
</script>

<style scoped>
.button {
  width: 50px;
}

.bucket {
  border: 1px solid black;
  width: 80px;
  height: 80px;
  display: inline-block;
  text-align: center;
  line-height: 80px;
}

.bucketEdit {
  border: 1px solid black;
  width: 80px;
  height: 80px;
  display: inline-block;
  text-align: center;
  line-height: 80px;
}

.bucket:hover {
  cursor: pointer;
  transform: scale(1.05);
}


.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

input:checked + .slider {
  background-color: #4CAF50; /* Green when activated */
}

input:checked + .slider:before {
  transform: translateX(26px);
}

/* Styles for when not activated (boz) */
input:not(:checked) + .slider {
  background-color: #FF0000; /* Red when not activated */
}

.text {
  position: absolute;
  white-space: nowrap;
  top: 50%;
  transform: translateY(-50%);
  left: 60px; /* Adjust as needed */
  margin-left: 10px; /* Adjust as needed */
}
</style>
