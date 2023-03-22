<template>
  <v-container fluid class="fill-height">
    <v-row class="fill-height">
      <v-col cols="9" class="d-flex flex-column">
        <v-row justify="center">
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-left</v-icon>
          </v-btn>
          <v-table style="width: 30%;">
            <tr>
              <th style="width: 30%">ID</th>
              <th>Thema</th>
            </tr>
            <tr>
              <td>{{ currentPaket.id }}</td>
              <td>{{ currentPaket.thema }}</td>
            </tr>
          </v-table>
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-row>
        <v-row class="d-flex flex-nowrap">
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
          <div v-for="bucket in buckets" :key="bucket.id"  class="mr-4">
            <draggable
                v-if="this.selected.includes(bucket.id)"
                class="list-group ma-4"
                :list="getPaketSortedByBucket(bucket)"
                group="pakete"
                itemKey="name"
                @change="change($event,bucket)"
            >
              <template #header>
                <div class="paket ma-4">{{ bucket.name }}</div>
              </template>
              <template #item="{ element }">
                <div class="list-group-item ma-4 paket">{{ element.thema }}</div>
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
            <th>Ticket-NR</th>
            <th>Thema</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="paket of getPaketeWithNoBucket()" :key="paket.id">
            <td>{{ paket.ticket_nr }}</td>
            <td>{{ paket.thema }}</td>
          </tr>
          </tbody>
        </v-table>
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
      currentPaket: this.allPaketeWithNoBucket[0],
      dialog: false,
      checked: true,
      selected: [0,1,2],
    }
  },
  setup() {
    const paketeStore = usePaketeStore()
    const bucketStore = useBucketsStore()
    const buckets = bucketStore.getBuckets
    const allPakete = paketeStore.getChildren
    const allPaketeWithNoBucket = paketeStore.getChildrenWithNoBucket
    return {allPakete, buckets, allPaketeWithNoBucket, paketeStore}
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
    getPaketeWithNoBucket() {
      return this.allPaketeWithNoBucket
    },
    getSelectedBuckets() {
      return this.buckets.filter(bucket => {
        this.selected.find(bucket.id)
      })
    },
    change(evt, bucket) {
      if (evt.added !== undefined) {
        const updatePaket = evt.added.element
        updatePaket.bucket = bucket.name
        this.paketeStore.updatePaket(updatePaket)
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