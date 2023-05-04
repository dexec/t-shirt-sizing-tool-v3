<template>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="d-flex flex-column" cols="9">
        <v-row v-if="paketeWithoutBucket.length > 0" justify="center" style="height: 30%">
          <v-btn @click="selectRow(this.paketeStore.paketeChildrenWithNoBucket().indexOf(this.listCurrentPaket[0])-1)"
                 class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-left</v-icon>
          </v-btn>
          <draggable
              :list="listCurrentPaket"
              class="dragArea list-group ma-4"
              ghost-class="destination-item"
              group="pakete"
              itemKey="name"
              @change="listCurrentPaketChanged"
          >
            <template #item="{ element }">
              <div class="list-group-item ma-4 paket">ID: {{ element.ticket_nr }}<br> {{ element.thema }}</div>
            </template>
          </draggable>
          <v-btn @click="selectRow(this.paketeStore.paketeChildrenWithNoBucket().indexOf(this.listCurrentPaket[0])+1)"
                 class="ma-2" color="primary" dark>
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
                <div @contextmenu="show" class="list-group-item ma-2 paket">{{ element.thema }}</div>

              </template>
            </draggable>
            <div style="position: fixed;bottom:500px;right: 500px">
            <v-menu v-model="showMenu">
              <v-list>
                <v-list-item>
                  <v-list-item-title>Zuweisung aufheben</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            </div>
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
        <v-table id="paketeWithoutBucketTable">
          <thead>
          <tr>
            <th style="width: 30%">Ticket-NR</th>
            <th>Thema</th>
          </tr>
          </thead>
          <tbody v-if="this.paketeWithoutBucket.length>0">
          <tr @click="selectRow(index)" v-for="(paket, index) of this.paketeWithoutBucket" :key="paket.id">
            <td>{{ paket.ticket_nr }}</td>
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
      showMenu: false,
      x: 0,
      y: 0,
      dialog: false,
      checked: true,
      selected: this.bucketStore.buckets.map(bucket => bucket.id),
      buckets: this.bucketStore.buckets,
      paketeLeafs: this.paketeStore.paketeChildren(),
      listCurrentPaket: []
    }
  },
  setup() {
    const paketeStore = usePaketeStore();
    const bucketStore = useBucketsStore();
    return {bucketStore, paketeStore}
  },
  mounted() {
    this.listCurrentPaket = [this.paketeStore.paketeChildrenWithNoBucket()[0]];
    document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")[1].style.background = "cyan";
  },
  computed: {
    paketeWithoutBucket() {
      return this.paketeStore.paketeChildrenWithNoBucket();
    }
  },
  methods: {
    show(e) {
      e.preventDefault()
      this.showMenu = false
      this.x = e.clientX
      this.y = e.clientY
      this.$nextTick(() => {
        this.showMenu = true
      })
    },
    selectRow(index) {
      if (this.paketeStore.paketeChildrenWithNoBucket()[index]) {
        const rows = document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")
        for (let i = 0; i < rows.length; i++) {
          rows[i].style.backgroundColor = "transparent"
        }
        document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")[index + 1].style.background = "cyan";
        this.listCurrentPaket.pop();
        this.listCurrentPaket.push(this.paketeStore.paketeChildrenWithNoBucket()[index]);
      }
    },
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
      if (evt.added) {
        const updatePaket = evt.added.element
        updatePaket.bucket = this.bucketStore.buckets.find(currentBucket => currentBucket.name === bucket.name)
      }
    },
    listCurrentPaketChanged(evt) {
      if (evt.removed) {
        this.listCurrentPaket.push(this.paketeStore.paketeChildrenWithNoBucket()[0])
        document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")[1].style.background = "cyan";
      }
      if (evt.added) {
        const indexOfAddedPaket = this.listCurrentPaket.indexOf(evt.added.element);
        this.listCurrentPaket.splice(indexOfAddedPaket, 1);
      }
    },
    removePaketFromBucket(evt) {

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