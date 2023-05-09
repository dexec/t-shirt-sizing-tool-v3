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
        <div v-for="bucket in bucketStore.buckets" :key="bucket.id">
          <v-container style="max-width: 300px;height: 150px">
            <v-row align="center" justify="space-between">
              <v-col cols="4">
                <v-btn :style="func(bucket)" @click="addNewBucketBefore()">
                  <v-icon icon="mdi-plus"></v-icon>
                </v-btn>
              </v-col>
              <v-col cols="4">
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
                    <v-text-field v-model="newBucketName" autofocus @blur="editBucket"></v-text-field>
                  </v-card>
                </v-hover>
              </v-col>
              <v-col cols="4">
                <v-btn :style="func(bucket)" @click="addNewBucketAfter()">
                  <v-icon icon="mdi-plus"></v-icon>
                </v-btn>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="8" offset="4">
                <v-btn :style="func(bucket)" @click="loeschenBucket">
                  <v-icon icon="mdi-minus"></v-icon>
                </v-btn>
              </v-col>
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

<script>
import {useBucketsStore} from "@/stores/buckets";

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
      if (bucket.id === this.currentSelectedBucket && this.currentEditBucket === -1) return ""
      else return "visibility: hidden"
    },
    addFirstBucket() {
      this.bucketStore.addNewBucket(0, true);
      this.currentEditBucket = 0
    },
    addNewBucketBefore() {
      const newBucket = this.bucketStore.addNewBucket(this.currentSelectedBucket, true);
      this.currentEditBucket = newBucket.id
    },
    addNewBucketAfter() {
      const newBucket = this.bucketStore.addNewBucket(this.currentSelectedBucket, false);
      this.currentEditBucket = newBucket.id
    },
    editBucket() {
      this.bucketStore.updateBucketName(this.currentEditBucket, this.newBucketName);
      this.clearData();
    },
    loeschenBucket() {
      this.bucketStore.deleteBucket(this.currentSelectedBucket)
      this.clearData()
    },
    clearData() {
      this.newBucketName = ''
      this.currentSelectedBucket = -1
      this.currentEditBucket = -1
    }
  },
}
</script>

<style scoped>
.bucket {
  border: 1px solid black;
  width: 80px;
  height: 80px;
  display: inline-block;
  text-align: center;
  line-height: 80px;
}
</style>
