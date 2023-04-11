<template>
  <v-select clearable v-model="selectedBucket" :items="bucketStore.getBuckets.map(bucket => bucket.name)" @update:modelValue="updatePaket"></v-select>
</template>

<script>
import {useBucketsStore} from "@/stores/buckets";
import {usePaketeStore} from "@/stores/pakete";

export default {
  name: "DropDownCellRenderer",
  data() {
    return {
      selectedBucket: this.params.node.data.bucket
    }
  },
  setup() {
    const bucketStore = useBucketsStore()
    const paketStore = usePaketeStore()
    return {bucketStore, paketStore}
  },
  methods: {
    updatePaket() {
      let aktuellesPaket = this.params.node.data;
      aktuellesPaket.bucket = this.selectedBucket;
      this.paketStore.updatePaket(aktuellesPaket)
    }
  }
}
</script>