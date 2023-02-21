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
      <div v-for="bucket in copyBuckets" :key="bucket.id">
        <v-container style="max-width: 300px;height: 150px">
          <v-row align="center" justify="space-between">
            <v-col cols="4">
              <v-btn :style="func(bucket)" @click="addNewBucketBefore(bucket)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="4">
              <v-hover v-slot="{hover}" v-if="currentEditBucket!==bucket.id">
                <v-card :class="{'on-hover':hover}" class="bucket" :elevation="hover ? 12:2"
                        :style="bucket.id===currentSelectedBucket? 'backgroundColor: green': ''
                        || bucket.name===''? 'border: 1px solid red !important':''"
                        @click="currentSelectedBucket=bucket.id" @dblclick="currentEditBucket=bucket.id; newBucketName=bucket.name">
                  {{ bucket.name }}
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
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="8" offset="4">
              <v-btn @click="loeschenBucket" :style="func(bucket)">
                <v-icon>mdi-minus</v-icon>
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

export default {
  name: "ProjektkalkulationView",
  data() {
    return {
      newBucketName: '',
      currentSelectedBucket: -1,
      currentEditBucket: -1,
    }
  },
  methods: {
    func(bucket) {
      if (bucket.id === this.currentSelectedBucket && this.currentEditBucket===-1) return ""
      else return "visibility: hidden"
    },
    addNewBucketBefore(bucket) {
      this.copyBuckets.splice(bucket.id, 0, {id: null, name: ''})
      for (let i = bucket.id; i < this.copyBuckets.length; i++) {
        this.copyBuckets[i].id = i
      }
      this.speichernBuckets()
      this.currentEditBucket = bucket.id - 1
    },
    addNewBucketAfter(bucket) {
      this.copyBuckets.splice(bucket.id+1, 0, {id: null, name: ''})
      for (let i = bucket.id; i < this.copyBuckets.length; i++) {
        this.copyBuckets[i].id = i
      }
      this.speichernBuckets()
      this.currentEditBucket = bucket.id +1
    },
    editBucket() {
      this.copyBuckets[this.currentEditBucket].name = this.newBucketName
      this.speichernBuckets()
    },
    loeschenBucket() {
      this.copyBuckets.splice(this.currentSelectedBucket, 1)
      for (let i = 0; i < this.copyBuckets.length; i++) {
        this.copyBuckets[i].id = i
      }
      this.speichernBuckets()
    },
    speichernBuckets() {
      this.clearData()
      this.$store.commit('updateAllBuckets', this.copyBuckets)
    },
    clearData() {
      this.newBucketName = ''
      this.currentSelectedBucket = -1
      this.currentEditBucket = -1
    }
  },
  computed: {
    copyBuckets() {
      return JSON.parse(JSON.stringify(this.buckets))
    },
    buckets() {
      return this.$store.state.buckets
    }
  }
}
</script>
