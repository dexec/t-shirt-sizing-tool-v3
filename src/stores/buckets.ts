import {defineStore} from 'pinia';
import saveFile from './file.json';
import {Bucket} from "@/Bucket";
import {usePaketeStore} from "@/stores/pakete";
import {ref} from "vue";

export const useBucketsStore = defineStore('buckets', () => {
    const buckets = ref<Bucket[]>([])
    for (const bucketFile of saveFile.buckets) {
        const newBucket = new Bucket(bucketFile.name)
        buckets.value.push(newBucket)
    }

    function getBucketNames() {
        return buckets.value.map(bucket => bucket.name)
    }
    function updateBucketName(id: number, newName: string) {
        const bucketToUpdate = buckets.value.find(bucket => bucket.id == id) as Bucket
        bucketToUpdate.name = newName;
    }

    function addNewBucket(id: number, before: boolean): Bucket {
        const newBucket = new Bucket('');
        const selectedBucket = buckets.value.find(bucket => bucket.id == id) as Bucket
        const indexOfNewBucket = before ? buckets.value.indexOf(selectedBucket) : buckets.value.indexOf(selectedBucket) + 1;
        buckets.value.splice(indexOfNewBucket, 0, newBucket)
        return newBucket;
    }

    function deleteBucket(id: number) {
        const pakete = usePaketeStore();
        const indexOfBucketToDelete = buckets.value.findIndex(bucket => bucket.id==id)
        const bucketToDelete = buckets.value[indexOfBucketToDelete] as Bucket
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