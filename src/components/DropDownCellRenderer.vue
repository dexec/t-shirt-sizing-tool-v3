<template>
  <div v-if="this.params.node.data.children.length===0">
  <v-select clearable v-model="selectedBucket" :items="bucketStore.getBuckets().map(bucket => bucket.name)"
            @update:modelValue="updatePaket" :open-on-clear="false"></v-select></div>
</template>

<script>
import {useBucketsStore} from "@/stores/buckets";
import {usePaketeStore} from "@/stores/pakete";
import {Bucket} from "@/Bucket";

export default {
  name: "DropDownCellRenderer",
  data() {
    return {
      selectedBucket: this.params.node.data.bucket ? this.params.node.data.bucket.name : null
    };
  },
  setup() {
    const bucketStore = useBucketsStore();
    const paketStore = usePaketeStore();
    return {bucketStore, paketStore};
  },
  methods: {
    updatePaket() {
      let aktuellesPaket = this.params.node.data;
      aktuellesPaket.bucket = this.bucketStore.getBuckets().find(bucket => bucket.name === this.selectedBucket)
      this.paketStore.updatePaket(aktuellesPaket);
    }
  }
};
</script>