<template>
  <!--  <v-autocomplete v-model="searchedPaket" :items="this.paketeChildren" item-title="ticket_nr" item-value="id"
                    label="Paket suchen" style="position: absolute;left:100px;top:200px; width: 200px"
                    @blur="this.searchedPaket=null"></v-autocomplete>-->
  <!--  <context-menu :provided-functions-prop="[...this.providedFunctions]"></context-menu>-->
  <v-container class="fill-height" fluid>
    <v-row class="fill-height">
      <v-col class="d-flex flex-column" cols="3">
        <v-dialog v-model="dialog" width="auto">
          <template v-slot:activator="{props}">
            <v-btn class="mb-6" v-bind="props">Buckets konfigurieren</v-btn>
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
        <h2>Arbeitspakete ohne Bucket</h2>
        <v-table>
          <thead>
          <tr>
            <th style="width: 30%">Ticket-NR</th>
            <th>Thema</th>
          </tr>
          </thead>
<!--          TODO Idee: onStart des Drags nutzen, keine Tabelle sondern Pakete der Klasse "paket" und daneben Ticketnr. Dann onSart abfangen und Paket aus der Tabelle entfernen.-->
        <draggable
        :list="paketeWithoutBucket"
        tag="tbody"
        class="dragArea list-group"
        group="pakete"
        itemKey="name"
        ghostClass="destination-item"
        @change="removePaketFromBucket"
        >
          <template #item="{ element }">
            <tr>
              <td >{{ element.ticket_nr }}</td>
              <td>{{ element.thema }}</td>
            </tr>
          </template>
        </draggable>
        </v-table>
        <span v-if="paketeWithoutBucket.length===0">
          Es gibt keine Pakete ohne Bucket
        </span>
      </v-col>
      <v-col class="d-flex flex-column" cols="9">
        <v-row class="d-flex flex-nowrap justify-center" style="height: 70%">
          <div v-for="bucket in buckets" :key="bucket.id">
            <draggable
                v-if="selected.includes(bucket.id)"
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
                <div :style="searchPaket(element)" class="list-group-item ma-2 paket">{{ element.thema }}
                </div>
              </template>
            </draggable>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import {usePaketeStore} from "@/stores/pakete";
import {useBucketsStore} from "@/stores/buckets";
import draggable from "vuedraggable";
import {computed, ref} from "vue";
import {Bucket} from "@/Bucket";
import {Paket} from "@/Paket";

const paketeStore = usePaketeStore();
const bucketStore = useBucketsStore();
const dialog = ref(false);
const checked = ref(false);
const buckets = bucketStore.buckets;
const paketeWithoutBucket = computed(() => paketeStore.paketeChildrenWithNoBucket())
const paketeChildren = computed(() => paketeStore.paketeChildren())
const selected = ref([0, 1, 2, 3, 4, 5])
const searchedPaket = ref(0)
if (!localStorage.getItem('selectedBuckets')) localStorage.setItem('selectedBuckets', JSON.stringify(buckets.map(bucket => bucket.id)))

function sortSelectedBuckets() {
  selected.value.sort(function (a, b) {
    return a - b
  })
}

function getPaketSortedByBucket(bucket: Bucket) {
  const result: Paket[] = [];
  paketeChildren.value.forEach(paket => {
    if (paket.bucket && paket.bucket == bucket) result.push(paket)
  })
  return result
}

function getSelectedBuckets() {
  return buckets.filter(bucket => {
    selected.value.find(bucket.id)
  })
}

function removePaketFromBucket(evt) {
  if(evt.added) {
   evt.added.element.bucket=null
  }
}

function changeBucketOfPaket(evt, bucket: Bucket) {
  if (evt.added) {
    const updatePaket = evt.added.element
    updatePaket.bucket = bucketStore.buckets.find(currentBucket => currentBucket == bucket)
  }
}

function searchPaket(paket: Paket) {
  if (paket.id === searchedPaket.value) {
    return "border-color: red"
  }
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

table, th, td {
  border: 1px solid;
  text-align: center;
}
</style>