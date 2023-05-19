import {defineStore} from 'pinia';
import saveFile from './file.json';
import {Bucket} from "@/Bucket";
import {ref} from "vue";
import {usePaketeStore} from "@/stores/pakete";
import {useVergleicheStore} from "@/stores/vergleiche";

export const useBucketsStore = defineStore('buckets', () => {
    const vergleiche = useVergleicheStore();
    const buckets = ref<Array<Bucket>>([]);
    for (const bucketFile of saveFile.buckets) {
        const newBucket = new Bucket(bucketFile.name)
        buckets.value.push(newBucket)
        vergleiche.currentSelectedBuckets.push(newBucket.id)
    }

    function getBucketNames() {
        return buckets.value.map(bucket => bucket.name)
    }
    function updateBucketName(id: number, newName: string) {
        const bucketToUpdate = buckets.value.find(bucket => bucket.id == id) as Bucket
        bucketToUpdate.name = newName;
    }

    function addNewBucket(idOfSelectedBucket: number, before: boolean): Bucket {
        const newBucket = new Bucket('');
        const selectedBucket = buckets.value.find(bucket => bucket.id == idOfSelectedBucket) as Bucket
        const indexOfNewBucket = before ? buckets.value.indexOf(selectedBucket) : buckets.value.indexOf(selectedBucket) + 1;
        buckets.value.splice(indexOfNewBucket, 0, newBucket)
        return newBucket;
    }

    function deleteBucket(id: number) {
        const pakete = usePaketeStore();
        const bucketToDelete = buckets.value.find(bucket => bucket.id == id) as Bucket
        const indexOfBucketToDelete = buckets.value.indexOf(bucketToDelete)
        buckets.value.splice(indexOfBucketToDelete, 1);
        pakete.paketeOfBucket(bucketToDelete).forEach(paket => paket.bucket=null)
    }

    return {
        buckets,
        getBucketNames,
        updateBucketName,
        deleteBucket,
        addNewBucket
    }
});