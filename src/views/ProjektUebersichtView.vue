<template>
  <div class="d-flex flex-column" style="width: 50%">
    <h1>Projektinformationen</h1>
    <h3>Projektname</h3>
    <v-text-field outlined solo></v-text-field>
    <h3>Beschreibung</h3>
    <v-textarea outlined solo></v-textarea>
    <h1>Buckets</h1>
    <!--        <div v-if="!alleBucketsBerarbeitenModus">
              <div class="d-flex flex-wrap">
                <div v-for="bucket in buckets" :key="bucket.id">
                  <v-card class="ma-5 bucket">{{ bucket.name }}</v-card>
                </div>
              </div>
              <v-btn @click="() => this.alleBucketsBerarbeitenModus=true">Buckets bearbeiten</v-btn>
            </div>
            <div v-else>
              <div class="d-flex flex-wrap align-center mb-5">
                <div v-for="bucket in copyBuckets" :key="bucket.id">
                  <v-btn>
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <v-hover v-if="currentEditBucket===bucket.name" v-slot="{hover}">
                    <v-card :class="{'on-hover':hover}" class="ma-5 bucket">
                      <v-text-field v-model=newBucketName @blur="editBucket"
                                    @click="currentEditBucket=currentSelectedBucket=bucket.name" autofocus></v-text-field>
                    </v-card>
                  </v-hover>
                  <v-hover v-else v-slot="{hover}">
                    <v-card :class="{'on-hover':hover}" class="ma-5 bucket" :elevation="hover ? 12:2"
                            :color="bucket.name===currentSelectedBucket ? 'blue':'undefined'"
                            @click="currentSelectedBucket=bucket.name" @dblclick="currentEditBucket=bucket.name">
                      {{ bucket.name }}
                    </v-card>
                  </v-hover>
                </div>
                <v-btn>
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>-->
    <div class="d-flex flex-wrap" style="height: 100%; width: 100%">
      <div v-for="(bucket,index) in bucketStore.buckets" :key="bucket.id">
        <v-container style="width: 300px;height: 150px">
          <v-row>
            <v-col>
              <v-btn :style="showButtons(bucket as Bucket)" class="mb-4 button" @click="addNewBucketBefore()">
                <v-icon icon="mdi-plus"></v-icon>
              </v-btn>
              <v-btn class="button" :style="showArrowLeft(bucket as Bucket, index)" @click="swapWithBucketBefore()">
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
                  <v-text-field v-model="newBucketName" id="textfield" @blur="clearData" autofocus @keydown="editBucket"></v-text-field>
                </v-card>
              </v-hover>
            </v-col>
            <v-col>
              <v-btn :style="showButtons(bucket as Bucket)" class="mb-4 button" @click="addNewBucketAfter()">
                <v-icon icon="mdi-plus"></v-icon>
              </v-btn>
              <v-btn class="button" :disabled="!(index < bucketStore.buckets.length - 1)" :style="showArrowRight(bucket as Bucket, index)" @click="swapWithBucketAfter()">
                <v-icon icon="mdi-arrow-right"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="center">
              <v-btn class="button" :style="showButtons(bucket as Bucket)" @click="loeschenBucket">
                <v-icon icon="mdi-minus"></v-icon>
              </v-btn>
          </v-row>
        </v-container>
      </div>
      <div v-if="bucketStore.buckets.length===0">
        <v-btn @click="addFirstBucket()">
          <v-icon icon="mdi-plus"></v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useBucketsStore} from "@/stores/buckets";
import {ref} from "vue";
import type {Bucket} from "@/Bucket";

const newBucketName = ref('')
const currentSelectedBucket = ref(-1)
const currentEditBucket = ref(-1)
const bucketStore = useBucketsStore();

function showButtons(bucket: Bucket): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value == -1) return ""
  else return "visibility: hidden"
}

function showArrowLeft(bucket: Bucket, index: number): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value === -1 && index > 0) return ""
  else return "display: none"
}

function showArrowRight(bucket: Bucket, index: number): string {
  if (bucket.id == currentSelectedBucket.value && currentEditBucket.value === -1) return ""
  else {
    return "display: none"
  }
}

function swapWithBucketBefore() {
  bucketStore.swapWithBucket(currentSelectedBucket.value, true)
}

function swapWithBucketAfter() {
  bucketStore.swapWithBucket(currentSelectedBucket.value, false)
}

function addFirstBucket() {
  bucketStore.addNewBucket(0, true);
  currentEditBucket.value = 0
}

function addNewBucketBefore() {
  const newBucket = bucketStore.addNewBucket(currentSelectedBucket.value, true);
  currentEditBucket.value = newBucket.id
}

function addNewBucketAfter() {
  const newBucket = bucketStore.addNewBucket(currentSelectedBucket.value, false);
  currentEditBucket.value = newBucket.id
}

function editBucket(e:KeyboardEvent) {
  if (e.key == 'Enter') {
    bucketStore.updateBucketName(currentEditBucket.value, newBucketName.value);
    document.getElementById("textfield")!.blur()
    clearData();
  }
  else if(e.key=='Escape') {
    document.getElementById("textfield")!.blur()
  }
}

function loeschenBucket() {
  bucketStore.deleteBucket(currentSelectedBucket.value)
  clearData()
}

function clearData() {
  newBucketName.value = ''
  currentSelectedBucket.value = -1
  currentEditBucket.value = -1
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
