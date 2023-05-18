<template>
  <v-autocomplete @blur="this.searchedPaket=null" v-model="searchedPaket" :items="this.paketeChildren"
                  item-title="ticket_nr" item-value="id"
                  style="position: fixed;left:100px;top:200px; width: 200px"></v-autocomplete>
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="d-flex flex-column" cols="9">
        <v-row v-if="paketeWithoutBucket.length > 0" justify="center" style="height: 30%">
          <v-btn class="ma-2"
                 color="primary" dark
                 @click="selectRow(this.paketeStore.paketeChildrenWithNoBucket().indexOf(this.listCurrentPaket[0])-1)">
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
          <v-btn class="ma-2"
                 color="primary" dark
                 @click="selectRow(this.paketeStore.paketeChildrenWithNoBucket().indexOf(this.listCurrentPaket[0])+1)">
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
                <div class="list-group-item ma-2 paket" :style="searchPaket(element)"
                     @contextmenu="showMenu($event,element)">{{ element.thema }}
                </div>
              </template>
            </draggable>
            <div class="wrapper">
              <div class="content">
                <div class="menu">
                  <span class="item" @click="this.currentContextMenuPaket.bucket=null;">Zuweisung aufheben</span>
                </div>
              </div>
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
          <tr v-for="(paket, index) of this.paketeWithoutBucket" :key="paket.id" @click="selectRow(index)">
            <td :style="searchPaket(paket)">{{ paket.ticket_nr }}</td>
            <td :style="searchPaket(paket)">{{ paket.thema }}</td>
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
import {useVergleicheStore} from "@/stores/vergleiche";

export default {
  name: "VergleichView",
  components: {
    draggable,
  },
  data() {
    return {
      searchedPaket: null,
      dialog: false,
      checked: true,
      selected: this.bucketStore.buckets.map(bucket => bucket.id),
      buckets: this.bucketStore.buckets,
      listCurrentPaket: [this.vergleicheStore.currentSelectedPaket],
      currentContextMenuPaket: {}
    }
  },
  setup() {
    const paketeStore = usePaketeStore();
    const bucketStore = useBucketsStore();
    const vergleicheStore = useVergleicheStore();
    return {vergleicheStore, bucketStore, paketeStore}
  },
  mounted() {
    const indexOfCurrentSelectedPaket = this.paketeWithoutBucket.indexOf(this.vergleicheStore.currentSelectedPaket);
    document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")[indexOfCurrentSelectedPaket + 1].style.background = "cyan";
  },
  computed: {
    paketeWithoutBucket() {
      return this.paketeStore.paketeChildrenWithNoBucket();
    },
    paketeChildren() {
      return this.paketeStore.paketeChildren();
    }
  },
  methods: {
    test() {
      console.log(this.searchedPaket)
    },
    showMenu(e, element) {
      this.currentContextMenuPaket = element;
      const contextMenu = document.querySelector(".wrapper")
      e.preventDefault();
      let x = e.clientX
      let y = e.clientY
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.style.display = "block";
      document.addEventListener("click", () => contextMenu.style.display = "none");
    },
    selectRow(index) {
      if (this.paketeWithoutBucket[index]) {
        const rows = document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")
        for (let i = 0; i < rows.length; i++) {
          rows[i].style.backgroundColor = "transparent"
        }
        document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")[index + 1].style.background = "cyan";
        this.listCurrentPaket.pop();
        this.vergleicheStore.currentSelectedPaket = this.paketeWithoutBucket[index];
        this.listCurrentPaket.push(this.paketeWithoutBucket[index])
      }
    },
    searchPaket(paket) {
      if (paket.id === this.searchedPaket) {
        return "border-color: red"
      }
    },
    sortSelectedBuckets() {
      this.selected.sort(function (a, b) {
        return a - b
      })
    },
    getPaketSortedByBucket(bucket) {
      const result = [];
      this.paketeChildren.forEach(paket => {
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
        this.vergleicheStore.currentSelectedPaket = this.paketeStore.paketeChildrenWithNoBucket()[0];
        this.listCurrentPaket.push(this.vergleicheStore.currentSelectedPaket)
        document.getElementById("paketeWithoutBucketTable").getElementsByTagName("tr")[1].style.background = "cyan";
      }
      if (evt.added) {
        const indexOfAddedPaket = this.listCurrentPaket.indexOf(evt.added.element);
        this.listCurrentPaket.splice(indexOfAddedPaket, 1);
      }
    }
  },
}
</script>

<style scoped>
.paket {
  border: 1px solid black;
  width: 170px;
  height: 50px;
  text-align: center;
}

.list-group {
  width: 200px;
  min-height: 250px;
}

.destination-item {
  display: none;
}

.wrapper {
  display: none;
  position: absolute;
  width: 300px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.wrapper .menu {
  padding: 10px 12px;
}

.content .item {
  list-style: none;
  height: 50px;
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  border-radius: 5px;
  margin-bottom: 2px;
  padding: 0 5px 0 10px;
}

.content .item:hover {
  background: #f2f2f2;
}

.content .item span {
  margin-left: 8px;
  font-size: 19px;
}

table, th, td {
  border: 1px solid;
  text-align: center;
}
</style>