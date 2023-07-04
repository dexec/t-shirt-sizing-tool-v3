import {defineStore} from "pinia";
import {useBucketsStore} from "@/stores/buckets";
import {usePaketeStore} from "@/stores/pakete";
import type {Bucket} from "@/Bucket";
import {Statistik} from "@/Statistik";
import type {Paket} from "@/Paket";
import {ref} from "vue";
import {useProjektStore} from "@/stores/projekt";
//TODO values() durch forEach ersetzen!
export const useStatistikenStore = defineStore('statistiken', () => {
    const buckets = useBucketsStore();
    const pakete = usePaketeStore();
    const projekt = useProjektStore();
    const statistiken = ref<Array<Statistik>>([]);
    berechne();

    function berechne() {
        statistiken.value.length = 0;
        if (projekt.bucketmodus) {
            buckets.buckets.forEach(bucket => {
                const castedBucket = bucket as Bucket
                statistiken.value.push(new Statistik(castedBucket, anzahlGeschaetzt(castedBucket), anzahlUngeschaetzt(castedBucket), anzahlGesamt(castedBucket), min(castedBucket), max(castedBucket), median(castedBucket), durchschnitt(castedBucket), anteilAnzahl(castedBucket), summeSchaetzungen(castedBucket), summeDurchschnitt(castedBucket), summeMedian(castedBucket)))
            })
        }
    }

    function anzahlGeschaetzt(bucket: Bucket): number {
        let result = 0;
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) result++;
        })
        return result;
    }

    function anzahlUngeschaetzt(bucket: Bucket): number {
        let result = 0;
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket && !paket.zurRechnungFreigegeben()) result++;
        })
        return result;
    }

    function anzahlGesamt(bucket: Bucket): number {
        let result = 0;
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket) result++;
        })
        return result;
    }

    function min(bucket: Bucket): number {
        let result = 0;
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) {
                if (result == 0 || paket.schaetzung! < result) result = paket.schaetzung!
            }
        })
        return result;
    }

    function max(bucket: Bucket): number {
        let result = 0;
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket && paket.zurRechnungFreigegeben() && paket.schaetzung! > result) result = paket.schaetzung!
        })
        return result;
    }

    function anteilAnzahl(bucket: Bucket): number {
        return anzahlGesamt(bucket as Bucket) / summeAlleBucketsGesamt() || 0;
    }

    function durchschnitt(bucket: Bucket): number {
        const paketeBucket: Paket[] = []
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket) paketeBucket.push(paket);
        })
        const sum = paketeBucket.filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0) as number;
        return (sum / anzahlGeschaetzt(bucket)) || 0;
    }

    function median(bucket: Bucket): number {
        const paketeBucket: Paket[] = []
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) paketeBucket.push(paket);
        })
        if (paketeBucket.length > 0) {
            const mid = Math.floor(paketeBucket.length / 2),
                nums = [...paketeBucket.map(paket => paket.schaetzung)].sort((a, b) => a! - b!);
            return paketeBucket.length % 2 != 0 ? nums[mid]! : (nums[mid - 1]! + nums[mid]!) / 2;
        } else return 0;
    }

    function summeSchaetzungen(bucket: Bucket): number {
        let result = 0;
        pakete.paketeChildren().forEach(paket => {
            if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) {
                result += paket.schaetzung!
            }
        })
        return result;
    }

    function summeDurchschnitt(bucket: Bucket): number {
        return durchschnitt(bucket) * pakete.paketeOfBucket(bucket).length;
    }

    function summeMedian(bucket: Bucket): number {
        return median(bucket) * pakete.paketeOfBucket(bucket).length;
    }

    function summeAlleBucketsGeschaetzt(): number {
        let result = 0;
        if (projekt.bucketmodus) {
            for (const bucket of buckets.buckets) {
                result += anzahlGeschaetzt(bucket as Bucket);
            }
        } else {
            pakete.paketeChildren().forEach(paket => {
                if (paket.zurRechnungFreigegeben()) {
                    result++
                }
            })
        }
        return result;
    }

    function summeAlleBucketsUngeschaetzt(): number {
        let result = 0;
        if (projekt.bucketmodus) {
            for (const bucket of buckets.buckets) {
                result += anzahlUngeschaetzt(bucket as Bucket);
            }
        } else {
            pakete.paketeChildren().forEach(paket => {
                if (!paket.zurRechnungFreigegeben()) {
                    result++
                }
            })
        }
        return result;
    }

    function summeAlleBucketsGesamt(): number {
        let result = 0;
        if (projekt.bucketmodus) {
            for (const bucket of buckets.buckets) {
                result += anzahlGesamt(bucket as Bucket);
            }
        } else return pakete.paketeChildren().length
        return result;
    }

    function summeAlleBucketsMin(): number {
        let result = 0;
        pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben()).forEach(paket => {
            if ((projekt.bucketmodus && paket.bucket || !projekt.bucketmodus) && (result == 0 || paket.schaetzung! < result)) {
                result = paket.schaetzung!;
            }
        })
        return result;
    }

    function summeAlleBucketsMax(): number {
        let result = 0;
        pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben()).forEach(paket => {
            if ((projekt.bucketmodus && paket.bucket || !projekt.bucketmodus) && paket.schaetzung! > result) result = paket.schaetzung!
        })
        return result;
    }

    function summeAlleBucketsDurchschnitt(): number {
        const sum = pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0) as number;
        return (sum / summeAlleBucketsGeschaetzt()) || 0;
    }

    function summeAlleBucketsMedian(): number {
        const filteredPaketeChildren = pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben());
        const mid = Math.floor(filteredPaketeChildren.length / 2),
            nums = [...filteredPaketeChildren.map(paket => paket.schaetzung)].sort((a, b) => a! - b!);
        return filteredPaketeChildren.length % 2 != 0 ? nums[mid]! : (nums[mid - 1]! + nums[mid]!) / 2;
    }

    function summeAlleBucketsSchaetzungenSumme(): number {
        let result = 0;
        if (projekt.bucketmodus) {
            for (const bucket of buckets.buckets) {
                result += summeSchaetzungen(bucket as Bucket);
            }
        } else {
            pakete.paketeChildren().forEach(paket => {
                if (paket.zurRechnungFreigegeben()) result += paket.schaetzung!
            })
        }
        return result;
    }

    function summeAlleBucketsDurchschnittSumme(): number {
        let result = 0;
        if (projekt.bucketmodus) {
            for (const bucket of buckets.buckets) {
                result += summeDurchschnitt(bucket as Bucket);
            }
        } else {
            return summeAlleBucketsDurchschnitt() * summeAlleBucketsGeschaetzt();
        }
        return result;
    }

    function summeAlleBucketsMedianSumme(): number {
        let result = 0;
        if (projekt.bucketmodus) {
            for (const bucket of buckets.buckets) {
                result += summeMedian(bucket as Bucket);
            }
        } else {
            return summeAlleBucketsMedian() * summeAlleBucketsGeschaetzt();
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
        summeAlleBucketsDurchschnitt,
        summeAlleBucketsMedian,
        summeAlleBucketsSchaetzungenSumme,
        summeAlleBucketsDurchschnittSumme,
        summeAlleBucketsMedianSumme
    }
})