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
    <div class="d-flex flex-wrap align-center mb-5" style="height: 100%; width: 100%">
      <div v-for="bucket in copyBuckets" :key="bucket._id">
        <v-container style="max-width: 300px;height: 150px">
          <v-row align="center" justify="space-between">
            <v-col cols="4">
              <v-btn :style="func(bucket)" @click="addNewBucketBefore(bucket)">
                <v-icon icon="mdi-plus"></v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-hover v-slot="{hover}" v-if="currentEditBucket!==bucket._id">
                <v-card :class="{'on-hover':hover}" class="bucket" :elevation="hover ? 12:2"
                        :style="bucket._id===currentSelectedBucket? 'backgroundColor: green': ''
                        || bucket._name===''? 'border: 1px solid red !important':''"
                        @click="currentSelectedBucket=bucket._id"
                        @dblclick="currentEditBucket=bucket._id; newBucketName=bucket._name">
                  {{bucket._name}}
                </v-card>
              </v-hover>
              <v-hover v-else v-slot="{hover}">
                <v-card :class="{'on-hover':hover}" class="bucket">
                  <v-text-field v-model="newBucketName" @blur="editBucket" autofocus></v-text-field>
                </v-card>
              </v-hover>
            </v-col>
            <v-col cols="4">
              <v-btn :style="func(bucket)" @click="addNewBucketAfter(bucket)">
                <v-icon icon="mdi-plus"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="8" offset="4">
              <v-btn @click="loeschenBucket" :style="func(bucket)">
                <v-icon icon="mdi-minus"></v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </div>
  </div>
</template>
<style>
.bucket {
  border: 1px solid black !important;
  width: 80px !important;
  height: 80px !important;
  display: inline-block !important;
  text-align: center !important;
  line-height: 80px !important;
}
</style>
<script>
import {useBucketsStore} from "@/stores/buckets";
import {Bucket} from "@/Bucket";

export default {
  name: "ProjektUbersichtView",
  data() {
    return {
      newBucketName: '',
      currentSelectedBucket: -1,
      currentEditBucket: -1,
    }
  },
  setup() {
    const bucketStore = useBucketsStore();
    return {bucketStore};
  },
  methods: {
    func(bucket) {
      if (bucket._id === this.currentSelectedBucket && this.currentEditBucket === -1) return ""
      else return "visibility: hidden"
    },
    addNewBucketBefore(bucket) {
      const newBucket = new Bucket('')
      const indexOfNewBucket = this.copyBuckets.indexOf(bucket);
      this.copyBuckets.splice(indexOfNewBucket, 0, newBucket)
      this.speichernBuckets()
      this.currentEditBucket = newBucket.id
    },
    addNewBucketAfter(bucket) {
      const newBucket = new Bucket('')
      const indexOfNewBucket = this.copyBuckets.indexOf(bucket)+1;
      this.copyBuckets.splice(indexOfNewBucket, 0, newBucket)
      this.speichernBuckets()
      this.currentEditBucket = newBucket.id
    },
    editBucket() {
      this.copyBuckets.find(bucket => bucket._id===this.currentEditBucket)._name = this.newBucketName
      this.speichernBuckets()
    },
    loeschenBucket() {
      const indexOfBucketToDelete = this.copyBuckets.indexOf(this.copyBuckets.find(bucket => bucket._id===this.currentSelectedBucket))
      this.copyBuckets.splice(indexOfBucketToDelete, 1)
      this.speichernBuckets()
    },
    speichernBuckets() {
      const newBuckets = []
      for(const bucket of this.copyBuckets) {
        const newBucket = new Bucket(bucket._name,bucket._id)
        newBuckets.push(newBucket)
      }
      this.bucketStore.updateAllBuckets(newBuckets)
      this.clearData()
    },
    clearData() {
      this.newBucketName = ''
      this.currentSelectedBucket = -1
      this.currentEditBucket = -1
    }
  },
  computed: {
    copyBuckets() {
      return JSON.parse(JSON.stringify(this.bucketStore.getBuckets()))
    },
  }
}
</script>
