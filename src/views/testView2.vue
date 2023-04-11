<template>
  <v-select
      clearable
      label="Select"
      :items="['California', 'Colorado', 'Florida', 'Georgia', 'Texas', 'Wyoming']"
  ></v-select>
</template>

<script>
import {useBucketsStore} from "@/stores/buckets";
import {storeToRefs} from "pinia";

export default {
  name: "testView2",
  data() {
    return {
      items: null
    }
  },
  setup() {
    const bucketStore = useBucketsStore()
    return {bucketStore}
  },
  created() {
    this.items = this.bucketStore.getBuckets.map(bucket => bucket.name);
  }

}
</script>