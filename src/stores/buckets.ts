import {defineStore} from 'pinia';
import saveFile from './file.json';
import {Bucket} from "@/Bucket";
import {ref} from "vue";

export const useBucketsStore = defineStore('buckets', () => {
    const buckets = ref<Array<Bucket>>([]);

    for (const bucketFile of saveFile.buckets) {
        buckets.value.push(new Bucket(bucketFile.name))
    }
    function getBuckets() {
        return buckets.value;
    }
    function updateAllBuckets(newBuckets: Bucket[]) {
        //TODO EINFÜGEN VON NEUEN BUCKETS UND LÖSCHEN VON ALTEN BUCKETS
        for(const bucket of newBuckets) {
            const oldBucket = buckets.value.find(currentBucket => currentBucket.id==bucket.id) as Bucket
            if(oldBucket) oldBucket.name=bucket.name
        }
    }
    return {getBuckets, updateAllBuckets}
});