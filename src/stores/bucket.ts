import { defineStore } from 'pinia'
import saveFile from './file.json'
export const useBucketsStore = defineStore('buckets', {
  state: () => ({
    buckets: "abc"
  }),
  getters: {
    getBuckets: (state) => state.buckets
  }
})