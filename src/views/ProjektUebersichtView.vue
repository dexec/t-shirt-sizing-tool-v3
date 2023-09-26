<template>
  <div class="d-flex flex-column justify-center">
    <v-btn @click="downloadProject">Projekt speichern</v-btn>
    <v-btn v-if="projektStore.bucketmodus" @click="projektStore.bucketmodus=!projektStore.bucketmodus">Bucketmodus
    </v-btn>
    <v-btn v-else-if="!projektStore.bucketmodus" @click="projektStore.bucketmodus=!projektStore.bucketmodus">Bucketloser
      Modus
    </v-btn>
<!--    TODO Nachkommastelle darf keine Nachkommastellen selbst haben-->
    <v-text-field v-model.number="projektStore.nachkommastellen" label="Nachkommastellen"></v-text-field>
    <h1>Projektinformationen</h1>
    <h3>Projektname</h3>
    <v-text-field v-model="projektStore.projektname" outlined solo></v-text-field>
    <h3>Beschreibung</h3>
    <v-textarea v-model="projektStore.projektbeschreibung" outlined solo></v-textarea>
    <h1 v-if="projektStore.bucketmodus">Buckets</h1>
    <div v-if="projektStore.bucketmodus" class="d-flex flex-wrap" style="height: 100%; width: 100%">
      <div v-for="(bucket,index) in bucketStore.bucketsAsSortedArray" :key="bucket.id">
        <v-container style="width: 300px;height: 150px" class="mb-4">
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
              <v-hover v-if="currentEditBucket!==bucket.id" v-slot="{hover}">
                <v-card :class="{'on-hover':hover}" :elevation="hover ? 12:2" :style="bucket.id===currentSelectedBucket? 'backgroundColor: green': ''
                        || bucket.name===''? 'border: 1px solid red !important':''"
                        class="bucket"
                        @click="currentSelectedBucket=bucket.id"
                        @dblclick="currentEditBucket=bucket.id; newBucketName=bucket.name">
                  {{ bucket.name }}
                </v-card>
              </v-hover>
              <v-hover v-else v-slot="{hover}">
                <v-card :class="{'on-hover':hover}" class="bucket">
                  <v-text-field id="textfield" v-model="newBucketName" autofocus @blur="clearData"
                                @keydown="editBucket" @focus="$event.target.select()"></v-text-field>
                </v-card>
              </v-hover>
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
              <v-btn :style="showButtons(bucket as Bucket)" class="button" @click="attemptDeleteBucket">
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
  <ConfirmDialog ref="confirmDialogRef" :text="'Sicher?'" :confirmFunction="deleteBucket" :cancelFunction="() => {}"></ConfirmDialog>
</template>

<script lang="ts" setup>
import {useBucketsStore} from "@/stores/buckets";
import {useProjektStore} from "@/stores/projekt";
import {ref} from "vue";
import type {Bucket} from "@/models/Bucket";
import {ExportProject} from "@/components/ExportProject";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {POSITION, useToast} from "vue-toastification";

const newBucketName = ref("")
const currentSelectedBucket = ref(-1)
const currentEditBucket = ref(-1)
const bucketStore = useBucketsStore();
const projektStore = useProjektStore();
const toast = useToast()

const confirmDialogRef = ref<InstanceType<typeof ConfirmDialog> | null>(null)

function attemptDeleteBucket() {
  confirmDialogRef.value!.showDialog()
}
function showButtons(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value == -1) return ""
  else return "visibility: hidden"
}

function showArrowLeft(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value === -1) return ""
  else return "display: none"
}

function showArrowRight(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value === -1) return ""
  else {
    return "display: none"
  }
}

function swapWithBucketBefore() {
  bucketStore.swapWithBucket(currentSelectedBucket.value, true)
  successToastBucketsSwapped()
}

function swapWithBucketAfter() {
  bucketStore.swapWithBucket(currentSelectedBucket.value, false)
  successToastBucketsSwapped()
}

function addFirstBucket() {
  const newBucket = bucketStore.addNewBucket(0, true);
  currentEditBucket.value = -1
  newBucketName.value = newBucket.name
  successToastBucketAdded()
}
function addNewBucketBefore() {
  const newBucket = bucketStore.addNewBucket(currentSelectedBucket.value, true);
  currentEditBucket.value = newBucket.id
  newBucketName.value = newBucket.name
  successToastBucketAdded()
}

function addNewBucketAfter() {
  const newBucket = bucketStore.addNewBucket(currentSelectedBucket.value, false);
  currentEditBucket.value = newBucket.id
  newBucketName.value = newBucket.name
  successToastBucketAdded()
}

function editBucket(e: KeyboardEvent) {
  if (e.key == 'Enter') {
    if(newBucketName.value=="") {
      errorToastBucketEmptyName()
    }
    else if(bucketStore.bucketsAsSortedArray.map(bucket => bucket.name).find(name => name == newBucketName.value)) {
      errorToastBucketDuplicateName(newBucketName.value)
    }
    else {
      bucketStore.updateBucketName(currentEditBucket.value, newBucketName.value);
      document.getElementById("textfield")!.blur()
      clearData();
    }
  } else if (e.key == 'Escape') {
    document.getElementById("textfield")!.blur()
  }
}

function deleteBucket() {
  const name = bucketStore.bucketsAsMap.get(currentSelectedBucket.value)?.name
  bucketStore.deleteBucket(currentSelectedBucket.value)
  clearData()
  successToastBucketDeleted(name ?? "")
}

function clearData() {
  newBucketName.value = ""
  currentSelectedBucket.value = -1
  currentEditBucket.value = -1
}

function downloadProject() {
  const exportProject = ExportProject.getInstance();
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

function successToastBucketAdded() {
  toast.success("Neues Bucket hinzugefügt!", {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
}

function successToastBucketsSwapped() {
  toast.success("Buckets getauscht!", {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
}

function successToastBucketDeleted(name: string) {
  toast.success(`Bucket ${name} gelöscht!`, {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
}

function errorToastBucketEmptyName() {
  toast.error("Das Bucket darf keinen leeren String haben!", {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
}

function errorToastBucketDuplicateName(name: String) {
  toast.error(`Das Bucket ${name} gibt es schon!`, {
    position: POSITION.TOP_RIGHT,
    timeout: 5000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  });
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
</style>
