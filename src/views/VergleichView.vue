<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="d-flex flex-column" cols="9">
        <v-row v-if="paketeWithoutBucket.length > 0" justify="center" style="height: 30%">
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-left</v-icon>
          </v-btn>
          <draggable
              :list="listCurrentPaket"
              class="dragArea list-group ma-4"
              ghost-class="destination-item"
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
        <v-row v-else justify="center" style="height: 30%">Keine Tickets da!</v-row>
        <v-row class="d-flex flex-nowrap justify-center" style="height: 70%">
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
                :list="getPaketSortedByBucket(bucket)"
                class="dragArea list-group ma-2"
                ghost-class="destination-item"
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
              <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :label=bucket.name
                          :value="bucket.id" @change="sortSelectedBuckets">
              </v-checkbox>
              <div v-if="buckets.length===0">Es gibt keine Buckets</div>
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
          <tbody v-if="this.paketeWithoutBucket.length>0">
          <tr v-for="paket of this.paketeWithoutBucket" :key="paket.id">
            <td>{{ paket.id }}</td>
            <td>{{ paket.thema }}</td>
          </tr>
          </tbody>
        </v-table>
        <span v-if="this.paketeWithoutBucket.length===0">
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
      selected: this.bucketStore.buckets.map(bucket => bucket.id),
      updateTable: true,
      buckets: this.bucketStore.buckets,
      paketeLeafs: this.paketeStore.paketeChildren(),
      paketeWithoutBucket: this.paketeStore.paketeChildrenWithNoBucket(),
      listCurrentPaket: []
    }
  },
  setup() {
    const paketeStore = usePaketeStore();
    const bucketStore = useBucketsStore();
    return {bucketStore, paketeStore}
  },
  mounted() {
    if (this.paketeStore.paketeChildrenWithNoBucket().length > 0) this.listCurrentPaket = [this.paketeStore.paketeChildrenWithNoBucket()[0]]
  },
  methods: {
    sortSelectedBuckets() {
      this.selected.sort(function (a, b) {
        return a - b
      })
    },
    getPaketSortedByBucket(bucket) {
      const result = [];
      this.paketeLeafs.forEach(paket => {
        if (paket.bucket && paket.bucket.name === bucket.name) result.push(paket)
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
        updatePaket.bucket = this.bucketStore.buckets.find(currentBucket => currentBucket.name === bucket.name)
      }
    },
    addCurrentPaket(evt) {
      if (evt.removed) {
        this.paketeWithoutBucket = this.paketeStore.paketeChildrenWithNoBucket()
        if (this.paketeStore.paketeChildrenWithNoBucket().length > 0) this.listCurrentPaket = [this.paketeStore.paketeChildrenWithNoBucket()[0]]
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

.list-group {
  width: 200px;
  min-height: 250px;
}

.destination-item {
  display: none;
}
</style>