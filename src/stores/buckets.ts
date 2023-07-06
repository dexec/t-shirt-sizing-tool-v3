import {defineStore} from 'pinia';
import saveFile from './file.json';
import {Bucket} from "@/Bucket";
import {usePaketeStore} from "@/stores/pakete";
import {ref} from "vue";

export const useBucketsStore = defineStore('buckets', () => {
    const bucketsAsSortedArray = ref<Bucket[]>([])
    const bucketsAsMap = ref(new Map<number, Bucket>());
    for (const bucketFile of saveFile.buckets) {
        const newBucket = new Bucket(bucketFile.name);
        bucketsAsSortedArray.value.push(newBucket);
        bucketsAsMap.value.set(newBucket.id, newBucket);
    }

    function getBucketNamesSorted() {
        return bucketsAsSortedArray.value.map(bucket => bucket.name)
    }

    function updateBucketName(id: number, newName: string) {
        const bucketToUpdate = bucketsAsMap.value.get(id);
        if (bucketToUpdate) {
            bucketToUpdate.name = newName;
        }
    }

    function addNewBucket(id: number, before: boolean): Bucket {
        const pakete = usePaketeStore();
        const newBucket = new Bucket('');
        bucketsAsMap.value.set(newBucket.id, newBucket);
        const selectedBucket = bucketsAsSortedArray.value.find(bucket => bucket.id == id) as Bucket
        const indexOfNewBucket = before ? bucketsAsSortedArray.value.indexOf(selectedBucket) : bucketsAsSortedArray.value.indexOf(selectedBucket) + 1;
        bucketsAsSortedArray.value.splice(indexOfNewBucket, 0, newBucket)
        pakete.unsortedPaketeListsSortedByBucketsMap.set(newBucket, [])
        return newBucket;
    }

    function deleteBucket(id: number) {
        const pakete = usePaketeStore();
        const bucketToDelete = bucketsAsMap.value.get(id);
        if(bucketToDelete) {
            const indexOfBucketToDelete = bucketsAsSortedArray.value.findIndex(bucket => bucketToDelete==bucket)
            bucketsAsSortedArray.value.splice(indexOfBucketToDelete, 1);
            pakete.paketeOfBucket(bucketToDelete).forEach(paket => paket.bucket = null)
            bucketsAsMap.value.delete(id);
        }
    }

    function swapWithBucket(id: number, before: boolean) {
        const indexOfbucketToSwap = bucketsAsSortedArray.value.findIndex(bucket => bucket.id == id)
        if (before && indexOfbucketToSwap > 0) {
            [bucketsAsSortedArray.value[indexOfbucketToSwap - 1], bucketsAsSortedArray.value[indexOfbucketToSwap]] = [bucketsAsSortedArray.value[indexOfbucketToSwap], bucketsAsSortedArray.value[indexOfbucketToSwap - 1]]
        } else if (!before && indexOfbucketToSwap < bucketsAsSortedArray.value.length - 1) {
            [bucketsAsSortedArray.value[indexOfbucketToSwap + 1], bucketsAsSortedArray.value[indexOfbucketToSwap]] = [bucketsAsSortedArray.value[indexOfbucketToSwap], bucketsAsSortedArray.value[indexOfbucketToSwap + 1]]
        }
    }

    return {
        bucketsAsSortedArray,
        bucketsAsMap,
        getBucketNamesSorted,
        updateBucketName,
        deleteBucket,
        addNewBucket,
        swapWithBucket
    }
});