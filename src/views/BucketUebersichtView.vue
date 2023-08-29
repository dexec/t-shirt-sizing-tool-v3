<template>
  <v-table v-if="projektStore.bucketmodus">
    <template v-slot:default>
      <thead>
      <tr>
        <th rowspan="2">Bucket</th>
        <th rowspan="2">Anzahl geschätzt</th>
        <th rowspan="2">Anzahl ungeschätzt</th>
        <th rowspan="2">Anzahl gesamt</th>
        <th rowspan="2">Min</th>
        <th rowspan="2">Max</th>
        <th rowspan="2">Anteil Anzahl</th>
        <th rowspan="2">Mittelwert</th>
        <th rowspan="2">Median</th>
        <th colspan="2">Summe Schätzungen</th>
        <th colspan="2">Durchschnittliche Summe</th>
        <th colspan="2">Mediane Summe</th>
      </tr>
      <tr>
        <th>PT</th>
        <th>%</th>
        <th>PT</th>
        <th>%</th>
        <th>PT</th>
        <th>%</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="statistik of statistiken.statistiken" :key="statistik.bucket.id">
        <td>{{ statistik.bucket.name }}</td>
        <td>{{ parseFloat(statistik.anzahlGeschaetzt.toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ parseFloat(statistik.anzahlUngeschaetzt.toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ parseFloat(statistik.anzahlGesamt.toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ minBucketmodus(statistik as Statistik) }}</td>
        <td>{{ maxBucketmodus(statistik as Statistik) }}</td>
        <td>{{ parseFloat((statistik.anteilAnzahl * 100).toFixed(projektStore.nachkommastellen)) + "%" }}</td>
        <td>{{ durchschnittBucketmodus(statistik as Statistik) }}</td>
        <td>{{ medianBucketmodus(statistik as Statistik) }}</td>
        <td>{{ schaetzungenSummeBucketmodusPT(statistik as Statistik) }}
        </td>
        <td>{{ schaetzungenSummeBucketmodusProzent(statistik as Statistik) }}</td>
        <td>{{ durchschnittSummeBucketmodusPT(statistik as Statistik) }}</td>
        <td>{{ durchschnittSummeBucketmodusProzent(statistik as Statistik) }}</td>
        <td>{{ medianSummeBucketmodusPT(statistik as Statistik) }}</td>
        <td>{{ medianSummeBucketmodusProzent(statistik as Statistik) }}</td>
      </tr>
      <!--        TODO Keine Summenreihe, wenn bucketmodus aber keine Buckets definiert sind.
              Dann lieber Nachricht, dass man Buckets definieren sollte-->
      <tr class="font-weight-bold">
        <td>Summe</td>
        <td>{{ parseFloat(statistiken.summeAlleBucketsGeschaetzt().toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ parseFloat(statistiken.summeAlleBucketsUngeschaetzt().toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ parseFloat(statistiken.summeAlleBucketsGesamt().toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ minSumme() }}</td>
        <td>{{ maxSumme() }}</td>
        <td></td>
        <td></td>
        <td></td>
        <td colspan="2">{{ summeSchaetzungenSumme() }}</td>
        <td colspan="2">{{ summeDurchschnittSumme() }}</td>
        <td colspan="2">{{ summeMedianSumme() }}</td>
      </tr>
      </tbody>
    </template>
  </v-table>
  <v-table v-else>
    <template v-slot:default>
      <thead>
      <tr>
        <th>Anzahl geschätzt</th>
        <th>Anzahl ungeschätzt</th>
        <th>Anzahl gesamt</th>
        <th>Min</th>
        <th>Max</th>
        <th>Mittelwert</th>
        <th>Median</th>
        <th>Summe Schätzungen</th>
        <th>Durchschnittliche Summe</th>
        <th>Mediane Summe</th>
      </tr>
      </thead>
      <tbody>
      <tr class="font-weight-bold">
        <td>{{ parseFloat(statistiken.summeAlleBucketsGeschaetzt().toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ parseFloat(statistiken.summeAlleBucketsUngeschaetzt().toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ parseFloat(statistiken.summeAlleBucketsGesamt().toFixed(projektStore.nachkommastellen)) }}</td>
        <td>{{ minSumme() }}</td>
        <td>{{ maxSumme() }}</td>
        <td>{{ durchschnittSumme() }}</td>
        <td>{{ medianSumme() }}</td>
        <td>{{ summeSchaetzungenSumme() }}</td>
        <td>{{ summeDurchschnittSumme() }}</td>
        <td>{{ summeMedianSumme() }}</td>
      </tr>
      </tbody>
    </template>
  </v-table>
</template>

<script lang="ts" setup>
import {useStatistikenStore} from "@/stores/statistiken";
import {useProjektStore} from "@/stores/projekt";
import type {Statistik} from "@/Statistik";

const statistiken = useStatistikenStore();
const projektStore = useProjektStore();
statistiken.berechne();
function minBucketmodus(statistik: Statistik) {
  if(statistik.min != null) {
    return parseFloat(statistik.min.toFixed(projektStore.nachkommastellen));
  }
  return ""
}

function maxBucketmodus(statistik: Statistik) {
  if(statistik.max != null) {
    return parseFloat(statistik.max.toFixed(projektStore.nachkommastellen));
  }
  return ""
}

function durchschnittBucketmodus(statistik: Statistik) {
  if(statistik.durchschnitt != null) {
    return parseFloat(statistik.durchschnitt.toFixed(projektStore.nachkommastellen))
  }
  return ""
}

function medianBucketmodus(statistik: Statistik) {
  if(statistik.median != null) {
    return parseFloat(statistik.median.toFixed(projektStore.nachkommastellen))
  }
  return ""
}
function schaetzungenSummeBucketmodusPT(statistik: Statistik) {
  if (statistik.summeSchaetzungen != null) {
    return parseFloat(statistik.summeSchaetzungen.toFixed(projektStore.nachkommastellen));
  }
  return "";
}

function schaetzungenSummeBucketmodusProzent(statistik: Statistik) {
  const summeSchaetzunSumme = statistiken.summeAlleBucketsSchaetzungenSumme();
  if (summeSchaetzunSumme == null || statistik.anzahlGeschaetzt == 0) {
    return "";
  } else {
    if (summeSchaetzunSumme == 0) {
      return "0%";
    } else {
      return parseFloat((statistik.summeSchaetzungen! / summeSchaetzunSumme * 100).toFixed(projektStore.nachkommastellen)) + "%"
    }
  }

}

function durchschnittSummeBucketmodusPT(statistik: Statistik) {
  if (statistik.summeDurchschnitt != null) {
    return parseFloat(statistik.summeDurchschnitt.toFixed(projektStore.nachkommastellen));
  }
  return "";
}

function durchschnittSummeBucketmodusProzent(statistik: Statistik) {
  const summeDurchschnittSumme = statistiken.summeAlleBucketsDurchschnittSumme();
  if (summeDurchschnittSumme == null || statistik.anzahlGeschaetzt == 0) {
    return "";
  } else {
    if (summeDurchschnittSumme == 0) {
      return "0%";
    } else {
      return parseFloat((statistik.summeDurchschnitt! / summeDurchschnittSumme * 100).toFixed(projektStore.nachkommastellen)) + "%";
    }
  }

}

function medianSummeBucketmodusPT(statistik: Statistik) {
  if (statistik.summeMedian != null) {
    return parseFloat(statistik.summeMedian.toFixed(projektStore.nachkommastellen))
  }
  return ""
}

function medianSummeBucketmodusProzent(statistik: Statistik) {
  const summeMedianSumme = statistiken.summeAlleBucketsMedianSumme();
  console.log(summeMedianSumme)
  if (summeMedianSumme == null || statistik.anzahlGeschaetzt == 0) {
    return ""
  } else {
    if (summeMedianSumme == 0) {
      return "0%"
    } else {
      return parseFloat((statistik.summeMedian! / summeMedianSumme * 100).toFixed(projektStore.nachkommastellen)) + "%"
    }
  }
}

function minSumme() {
  const summeMin = statistiken.summeAlleBucketsMin();
  if (summeMin != null) {
    return parseFloat(summeMin.toFixed(projektStore.nachkommastellen));
  } else return ""
}

function maxSumme() {
  const summeMax = statistiken.summeAlleBucketsMax();
  if (summeMax != null) return parseFloat(summeMax.toFixed(projektStore.nachkommastellen));
  else return ""
}

function durchschnittSumme() {
  const summeDurchschnitt = statistiken.summeAlleBucketsDurchschnitt();
  if (summeDurchschnitt != null) return parseFloat(summeDurchschnitt.toFixed(projektStore.nachkommastellen))
  else return ""
}

function medianSumme() {
  const summeMedian = statistiken.summeAlleBucketsMedian();
  if (summeMedian != null) return parseFloat(summeMedian.toFixed(projektStore.nachkommastellen))
  else return ""
}

function summeSchaetzungenSumme() {
  const summeSchaetzungen = statistiken.summeAlleBucketsSchaetzungenSumme()
  if (summeSchaetzungen != null) return parseFloat(summeSchaetzungen.toFixed(projektStore.nachkommastellen))
  else return ""
}

function summeDurchschnittSumme() {
  const summeDurchschnitt = statistiken.summeAlleBucketsDurchschnittSumme()
  if (summeDurchschnitt != null) return parseFloat(summeDurchschnitt.toFixed(projektStore.nachkommastellen));
  else return ""
}

function summeMedianSumme() {
  const summeMedian = statistiken.summeAlleBucketsMedianSumme()
  if (summeMedian != null) return parseFloat(summeMedian.toFixed(projektStore.nachkommastellen))
  else return ""
}

</script>

<style scoped>
table, th, td {
  border: 1px solid;
  text-align: center !important;
  empty-cells: show;
}
</style>