import { defineStore } from 'pinia'
import saveFile from './file.json'
import type { Bucket } from "@/Bucket";

const buckets: Bucket[] = saveFile.buckets;
export const useBucketsStore = defineStore('buckets', {
  state: () => ({
    buckets: buckets
  }),
  getters: {
    getBuckets(state) {
      return state.buckets
    }
  },
  actions: {
    updateAllBuckets(newBuckets: Bucket[]) {
      this.buckets = newBuckets;
    }
  }
})