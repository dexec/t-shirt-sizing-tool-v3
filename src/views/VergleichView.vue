<template>
  <v-container fluid class="fill-height">
    <v-row class="fill-height">
      <v-col cols="9" class="d-flex flex-column">
        <v-row justify="center">
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-left</v-icon>
          </v-btn>
          <!--          <v-table style="width: 30%;">
                      <tr>
                        <th style="width: 30%">ID</th>
                        <th>Thema</th>
                      </tr>
                      <tr>
                        <td>{{ currentPaket.id }}</td>
                        <td>{{ currentPaket.thema }}</td>
                      </tr>
                    </v-table>-->
          <draggable
              class="list-group ma-4"
              :list="listCurrentPaket"
              group="pakete"
              itemKey="name"
              @change="addCurrentPaket"
          >
            <template #item="{ element }">
              <div class="list-group-item ma-4 paket">{{ element.thema }}</div>
            </template>
          </draggable>
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-row>
        <v-row class="d-flex flex-nowrap justify-center">
          <!--          <v-table v-for="selectedBuckedId in selected" :key="selected.indexOf(selectedBuckedId)" class="mr-4"
                             style="width: 30%">
                      <tr>
                        <th colspan="2">
                          {{ buckets.find(bucket => bucket.id === selectedBuckedId).name }}
                        </th>
                      </tr>
                      <tr v-for="paket in rowData.filter(paketInRowData => paketInRowData.bucket===buckets.find(bucket => bucket.id === selectedBuckedId).name)"
                          :key="paket.id">
                        <td style="width: 10%">{{ paket.id }}</td>
                        <td>{{ paket.thema }}</td>
                      </tr>
                    </v-table>-->
          <div v-for="bucket in buckets" :key="bucket.id">
            <draggable
                v-if="this.selected.includes(bucket.id)"
                class="list-group ma-2"
                :list="getPaketSortedByBucket(bucket)"
                group="pakete"
                itemKey="name"
                @change="changeBucketOfPaket($event,bucket)"
            >
              <template #header>
                <div class="paket ma-2">{{ bucket.name }}</div>
              </template>
              <template #item="{ element }">
                <div class="list-group-item ma-2 paket">{{ element.thema }}</div>
              </template>
            </draggable>
          </div>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-dialog v-model="dialog" width="auto">
          <template v-slot:activator="{props}">
            <v-btn class="mb-4" v-bind="props">Buckets konfigurieren</v-btn>
          </template>
          <v-card>
            <v-card-text>
              <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :value="bucket.id"
                          :label=bucket.name @change="sortSelectedBuckets">
              </v-checkbox>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-table>
          <thead>
          <tr>
            <th style="width: 30%">Ticket-NR</th>
            <th>Thema</th>
          </tr>
          </thead>
          <tbody v-if="this.allPaketeWithNoBucket.length>0">
          <tr v-for="paket of this.allPaketeWithNoBucket" :key="paket.id">
            <td>{{ paket.id }}</td>
            <td>{{ paket.thema }}</td>
          </tr>
          </tbody>
        </v-table>
        <span v-if="this.allPaketeWithNoBucket.length===0">
          Es gibt keine Pakete ohne Bucket
        </span>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {usePaketeStore} from "@/stores/pakete";
import {useBucketsStore} from "@/stores/buckets";
import draggable from "vuedraggable";

export default {
  name: "VergleichView",
  components: {
    draggable,
  },
  data() {
    return {
      dialog: false,
      checked: true,
      selected: this.bucketStore.getBuckets.map(bucket => bucket.id),
      updateTable: true,
      buckets: this.bucketStore.getBuckets,
      allPakete: this.paketeStore.getChildren,
      allPaketeWithNoBucket: this.paketeStore.getChildrenWithNoBucket,
      listCurrentPaket: []
    }
  },
  setup() {
    const paketeStore = usePaketeStore()
    const bucketStore = useBucketsStore()
    return {bucketStore, paketeStore}
  },
  mounted() {
    if (this.paketeStore.getChildrenWithNoBucket.length > 0) this.listCurrentPaket = [this.paketeStore.getChildrenWithNoBucket[0]]
  },
  methods: {
    sortSelectedBuckets() {
      this.selected.sort(function (a, b) {
        return a - b
      })
    },
    getPaketSortedByBucket(bucket) {
      const result = [];
      this.allPakete.forEach(paket => {
        if (paket.bucket === bucket.name) result.push(paket)
      })
      return result
    },
    getSelectedBuckets() {
      return this.buckets.filter(bucket => {
        this.selected.find(bucket.id)
      })
    },
    changeBucketOfPaket(evt, bucket) {
      if (evt.added !== undefined) {
        const updatePaket = evt.added.element
        updatePaket.bucket = bucket.name
        this.paketeStore.updatePaket(updatePaket)
      }
    },
    addCurrentPaket(evt) {
      if (evt.removed) {
        this.allPaketeWithNoBucket = this.paketeStore.getChildrenWithNoBucket
        if (this.paketeStore.getChildrenWithNoBucket.length > 0) this.listCurrentPaket = [this.paketeStore.getChildrenWithNoBucket[0]]
      }
    }
  },
}
</script>

<style>
.paket {
  border: 1px solid black !important;
  width: 170px !important;
  height: 50px !important;
  text-align: center !important;
}
</style>