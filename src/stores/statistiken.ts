import {defineStore} from "pinia";
import {useBucketsStore} from "@/stores/buckets";
import {usePaketeStore} from "@/stores/pakete";
import type {Bucket} from "@/Bucket";
import {Statistik} from "@/Statistik";
import type {Paket} from "@/Paket";
import {ref} from "vue";

export const useStatistikenStore = defineStore('statistiken', () => {
    const buckets = useBucketsStore();
    const pakete = usePaketeStore();

    const statistiken = ref<Array<Statistik>>([]);
    berechne();
    function berechne() {
        statistiken.value.length = 0;
        for(const bucket of buckets.buckets.values()) {
            const castedBucket = bucket as Bucket
            statistiken.value.push(new Statistik(castedBucket, anzahlGeschaetzt(castedBucket), anzahlUngeschaetzt(castedBucket), anzahlGesamt(castedBucket), min(castedBucket), max(castedBucket), median(castedBucket), durchschnitt(castedBucket), anteilAnzahl(castedBucket), summeSchaetzungen(castedBucket), summeDurchschnitt(castedBucket), summeMedian(castedBucket)))
        }
    }
    function anzahlGeschaetzt(bucket: Bucket): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket && paket.schaetzung) result++;
        }
        return result;
    }

    function anzahlUngeschaetzt(bucket: Bucket): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket && !paket.schaetzung) result++;
        }
        return result;
    }

    function anzahlGesamt(bucket: Bucket): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket) result++;
        }
        return result;
    }

    function min(bucket: Bucket): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket && paket.schaetzung) {
                if (result == 0 || paket.schaetzung < result) result = paket.schaetzung
            }
        }
        return result;
    }

    function max(bucket: Bucket): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket && paket.schaetzung > result) result = paket.schaetzung
        }
        return result;
    }

    function anteilAnzahl(bucket: Bucket): number {
        return anzahlGesamt(bucket as Bucket) / summeAlleBucketsGesamt() || 0;
    }

    function durchschnitt(bucket: Bucket): number {
        const paketeBucket: Paket[] = []
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket) paketeBucket.push(paket);
        }
        const sum = paketeBucket.map(paket => paket.schaetzung).reduce((a, b) => a + b, 0);
        return (sum / anzahlGeschaetzt(bucket)) || 0;
    }

    function median(bucket: Bucket): number {
        const paketeBucket: Paket[] = []
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket && paket.schaetzung) paketeBucket.push(paket);
        }
        if (paketeBucket.length > 0) {
            const mid = Math.floor(paketeBucket.length / 2),
                nums = [...paketeBucket.map(paket => paket.schaetzung)].sort((a, b) => a - b);
            return paketeBucket.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
        } else return 0;
    }
    function summeSchaetzungen(bucket: Bucket): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket == bucket && paket.schaetzung) {
                result += paket.schaetzung
            }
        }
        return result;
    }

    function summeDurchschnitt(bucket: Bucket): number {
        return durchschnitt(bucket) * pakete.paketeOfBucket(bucket).length;
    }

    function summeMedian(bucket: Bucket): number {
        return median(bucket) * pakete.paketeOfBucket(bucket).length;
    }
    function summeAlleBucketsMin(): number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket && paket.schaetzung) {
                if (result == 0 || paket.schaetzung < result) result = paket.schaetzung
            }
        }
        return result;
    }
    function summeAlleBucketsMax():number {
        let result = 0;
        for (const paket of pakete.paketeAsMap.values()) {
            if (paket.bucket && paket.schaetzung > result) result = paket.schaetzung
        }
        return result;
    }
    function summeAlleBucketsGeschaetzt(): number {
        let result = 0;
        for (const bucket of buckets.buckets) {
            result += anzahlGeschaetzt(bucket as Bucket);
        }
        return result;
    }

    function summeAlleBucketsUngeschaetzt(): number {
        let result = 0;
        for (const bucket of buckets.buckets) {
            result += anzahlUngeschaetzt(bucket as Bucket);
        }
        return result;
    }

    function summeAlleBucketsGesamt(): number {
        let result = 0;
        for (const bucket of buckets.buckets) {
            result += anzahlGesamt(bucket as Bucket);
        }
        return result;
    }

    function summeAlleBucketsSchaetzungen(): number {
        let result = 0;
        for (const bucket of buckets.buckets) {
            result += summeSchaetzungen(bucket as Bucket);
        }
        return result;
    }

    function summeAlleBucketsDurchschnitt(): number {
        let result = 0;
        for (const bucket of buckets.buckets) {
            result += summeDurchschnitt(bucket as Bucket);
        }
        return result;
    }

    function summeAlleBucketsMedian(): number {
        let result = 0;
        for (const bucket of buckets.buckets) {
            result += summeMedian(bucket as Bucket);
        }
        return result;
    }

    return {
        statistiken,
        berechne,
        summeAlleBucketsGeschaetzt,
        summeAlleBucketsUngeschaetzt,
        summeAlleBucketsGesamt,
        summeAlleBucketsMin,
        summeAlleBucketsMax,
        summeAlleBucketsSchaetzungen,
        summeAlleBucketsDurchschnitt,
        summeAlleBucketsMedian
    }
})