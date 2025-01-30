import { defineStore } from "pinia";
import { useBucketContainer } from "@/stores/bucketContainer";
import { usePaketContainer } from "@/stores/paketContainer";
import type { Bucket } from "@/models/Bucket";
import { Statistik } from "@/models/Statistik";
import type { Paket } from "@/models/Paket";
import { ref } from "vue";
import { useKonfigContainer } from "@/stores/konfigContainer";

export const useStatistikenStore = defineStore("statistiken", () => {
  const buckets = useBucketContainer();
  const pakete = usePaketContainer();
  const projekt = useKonfigContainer();
  const statistiken = ref<Array<Statistik>>([]);
  berechne();

  function berechne() {
    statistiken.value.length = 0;
    if (projekt.bucketmodus) {
      buckets.bucketsAsSortedArray.forEach(bucket => {
        const castedBucket = bucket as Bucket;
        statistiken.value.push(new Statistik(castedBucket, anzahlGeschaetzt(castedBucket), anzahlUngeschaetzt(castedBucket), anzahlGesamt(castedBucket), min(castedBucket), max(castedBucket), median(castedBucket), durchschnitt(castedBucket), anteilAnzahl(castedBucket), summeSchaetzungen(castedBucket), summeDurchschnitt(castedBucket), summeMedian(castedBucket)));
      });
    }
  }

  function anzahlGeschaetzt(bucket: Bucket): number {
    let result = 0;
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) result++;
    });
    return result;
  }

  function anzahlUngeschaetzt(bucket: Bucket): number {
    let result = 0;
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket && !paket.zurRechnungFreigegeben()) result++;
    });
    return result;
  }

  function anzahlGesamt(bucket: Bucket): number {
    let result = 0;
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket) result++;
    });
    return result;
  }

  function min(bucket: Bucket): number | null {
    let result: number | null = null;
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket === bucket && paket.zurRechnungFreigegeben()) {
        if (paket.schaetzung === 0) {
          result = 0;
          return;
        }
        if (result === null || paket.schaetzung! < result) {
          result = paket.schaetzung!;
        }
      }
    });
    return result;
  }


  function max(bucket: Bucket): number | null {
    let result: number | null = null;
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket && paket.zurRechnungFreigegeben() && (result == null || paket.schaetzung! > result)) result = paket.schaetzung!;
    });
    return result;
  }

  function anteilAnzahl(bucket: Bucket): number {
    return anzahlGesamt(bucket as Bucket) / summeAlleBucketsGesamt() || 0;
  }

  function durchschnitt(bucket: Bucket): number | null {
    const anzahlGeschaetztePakete = anzahlGeschaetzt(bucket);
    if (anzahlGeschaetztePakete == 0) return null;
    const paketeBucket: Paket[] = [];
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket) paketeBucket.push(paket);
    });
    const sum = paketeBucket.filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0) as number;
    return (sum / anzahlGeschaetztePakete);
  }

  function median(bucket: Bucket): number | null {
    const paketeBucket: Paket[] = [];
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) paketeBucket.push(paket);
    });
    if (paketeBucket.length > 0) {
      const mid = Math.floor(paketeBucket.length / 2),
        nums = [...paketeBucket.map(paket => paket.schaetzung)].sort((a, b) => a! - b!);
      return paketeBucket.length % 2 != 0 ? nums[mid]! : (nums[mid - 1]! + nums[mid]!) / 2;
    } else return null;
  }

  function summeSchaetzungen(bucket: Bucket): number | null {
    if (anzahlGeschaetzt(bucket) == 0) return null;
    let result = 0;
    pakete.paketeChildren().forEach(paket => {
      if (paket.bucket == bucket && paket.zurRechnungFreigegeben()) {
        result += paket.schaetzung!;
      }
    });
    return result;
  }

  function summeDurchschnitt(bucket: Bucket): number | null {
    if (anzahlGeschaetzt(bucket) == 0) return null;
    const durchschnittBucket = durchschnitt(bucket);
    if (durchschnittBucket) return durchschnittBucket * pakete.paketeOfBucket(bucket).length;
    else return 0;
  }

  function summeMedian(bucket: Bucket): number | null {
    if (anzahlGeschaetzt(bucket) == 0) return null;
    const medianBucket = median(bucket);
    if (medianBucket) return medianBucket * pakete.paketeOfBucket(bucket).length;
    else return 0;
  }

  function summeAlleBucketsGeschaetzt(): number {
    let result = 0;
    if (projekt.bucketmodus) {
      buckets.bucketsAsMap.forEach(bucket=> result += anzahlGeschaetzt(bucket as Bucket));
    } else {
      pakete.paketeChildren().forEach(paket => {
        if (paket.zurRechnungFreigegeben()) {
          result++;
        }
      });
    }
    return result;
  }

  function summeAlleBucketsUngeschaetzt(): number {
    let result = 0;
    if (projekt.bucketmodus) {
      buckets.bucketsAsMap.forEach(bucket => result += anzahlUngeschaetzt(bucket as Bucket));
    } else {
      pakete.paketeChildren().forEach(paket => {
        if (!paket.zurRechnungFreigegeben()) {
          result++;
        }
      });
    }
    return result;
  }

  function summeAlleBucketsGesamt(): number {
    let result = 0;
    if (projekt.bucketmodus) {
      buckets.bucketsAsMap.forEach(bucket => result += anzahlGesamt(bucket as Bucket));
    } else return pakete.paketeChildren().length;
    return result;
  }

  function summeAlleBucketsMin(): number | null {
    let result: number | null = null;
    pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben()).forEach(paket => {
      if ((projekt.bucketmodus && paket.bucket || !projekt.bucketmodus) && (result == null || paket.schaetzung! < result)) {
        result = paket.schaetzung!;
      }
    });
    return result;
  }

  function summeAlleBucketsMax(): number | null {
    let result: number | null = null;
    pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben()).forEach(paket => {
      if ((projekt.bucketmodus && paket.bucket || !projekt.bucketmodus) && (result == null || paket.schaetzung! > result)) result = paket.schaetzung!;
    });
    return result;
  }

  function summeAlleBucketsDurchschnitt(): number | null {
    const summeGeschaetzt = summeAlleBucketsGeschaetzt()
    if(summeGeschaetzt==0) return null;
    const summeDurschnitt = pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben()).map(paket => paket.schaetzung).reduce((acc, schaetzung) => acc! + (schaetzung ?? 0), 0) as number;
    return (summeDurschnitt / summeGeschaetzt);
  }

  function summeAlleBucketsMedian(): number | null {
    const filteredPaketeChildren = pakete.paketeChildren().filter(paket => paket.zurRechnungFreigegeben());
    if(filteredPaketeChildren.length==0) return null;
    const mid = Math.floor(filteredPaketeChildren.length / 2),
      nums = [...filteredPaketeChildren.map(paket => paket.schaetzung)].sort((a, b) => a! - b!);
    return filteredPaketeChildren.length % 2 != 0 ? nums[mid]! : (nums[mid - 1]! + nums[mid]!) / 2;
  }

  function summeAlleBucketsSchaetzungenSumme(): number | null {
    let result = 0;
    if(summeAlleBucketsGeschaetzt()==0) return null
    if (projekt.bucketmodus) {
      buckets.bucketsAsMap.forEach(bucket => result += summeSchaetzungen(bucket as Bucket) ?? 0);
    } else {
      pakete.paketeChildren().forEach(paket => {
        if (paket.zurRechnungFreigegeben()) result += paket.schaetzung!;
      });
    }
    return result;
  }

  function summeAlleBucketsDurchschnittSumme(): number | null {
    let result = 0;
    if(summeAlleBucketsGeschaetzt()==0) return null;
    if (projekt.bucketmodus) {
      buckets.bucketsAsMap.forEach(bucket => result += summeDurchschnitt(bucket as Bucket) ?? 0);
    } else {
      const duchschnittSumme = summeAlleBucketsDurchschnitt();
      if(duchschnittSumme!=null)
      return duchschnittSumme * summeAlleBucketsGesamt();
      else return null;
    }
    return result;
  }

  function summeAlleBucketsMedianSumme(): number | null {
    let result = 0;
    if(summeAlleBucketsGeschaetzt()==0) return null;
    if (projekt.bucketmodus) {
      buckets.bucketsAsMap.forEach(bucket => result += summeMedian(bucket as Bucket) ?? 0);
    } else {
      const medianSumme = summeAlleBucketsMedian();
      if(medianSumme!=null) return  medianSumme* summeAlleBucketsGesamt();
      else return null;
    }
    return result;
  }

  return {
    statistiken,
    berechne,
    min,
    max,
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
  };
});