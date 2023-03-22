<template>
  <v-container>
    <v-row>
      <v-col v-for="bucket of this.buckets" :key="bucket.id">
        <draggable
                   class="list-group ma-4"
                   :list="getPaketSortedByBucket(bucket.name)"
                   group="people"
                   itemKey="name"
                   @change="change($event,bucket)"
        >
          <template #header>
            <div class="paket ma-4">{{bucket.name}}</div>
          </template>
          <template #item="{ element }">
            <div class="list-group-item ma-4 paket">{{ element.thema }}</div>
          </template>
        </draggable>
      </v-col>
    </v-row>
  </v-container>

</template>

<script>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import {usePaketeStore} from "@/stores/pakete";
import draggable from 'vuedraggable'
import {useBucketsStore} from "@/stores/buckets";

export default {
  name: 'testView2',
  data() {
    return {}
  },
  components: {
    draggable
  },
  computed: {},
  setup() {
    const paketeStore = usePaketeStore()
    const bucketStore = useBucketsStore();
    const rowData = paketeStore.paketeAsTreeView
    const buckets = bucketStore.getBuckets;
    return {rowData, paketeStore, buckets}
  },
  methods: {
    getPaketSortedByBucket(bucket) {
      const result = [];
      this.paketeStore.paketeAsMap.forEach(paket => {
        if (paket.bucket === bucket) result.push(paket)
      })
      return result
    },
    change(evt, bucket) {
      if (evt.added !== undefined) {
        const updatePaket = evt.added.element
        updatePaket.bucket = bucket.name
        this.paketeStore.updatePaket(updatePaket)
      }
    }
  }
}
</script>

<style>

</style>