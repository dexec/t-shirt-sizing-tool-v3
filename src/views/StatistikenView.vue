<template>
  <v-table v-if="konfigContainer.bucketmodus">
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
      <tr v-for="statistik of statistikenService.statistiken" :key="statistik.bucket.id">
        <td>{{ statistik.bucket.name }}</td>
        <td>{{ statistik.anzahlGeschaetzt }}</td>
        <td>{{ statistik.anzahlUngeschaetzt }}</td>
        <td>{{ statistik.anzahlGesamt }}</td>
        <td>{{ minBucketmodus(statistik as Statistik) }}</td>
        <td>{{ maxBucketmodus(statistik as Statistik) }}</td>
        <td>{{ Number(statistik.anteilAnzahl * 100).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen }) + "%" }}</td>
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
      <tr class="font-weight-bold">
        <td>Summe</td>
        <td>{{ statistikenService.summeAlleBucketsGeschaetzt() }}</td>
        <td>{{ statistikenService.summeAlleBucketsUngeschaetzt() }}</td>
        <td>{{ statistikenService.summeAlleBucketsGesamt() }}</td>
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
        <td>{{ statistikenService.summeAlleBucketsGeschaetzt() }}</td>
        <td>{{ statistikenService.summeAlleBucketsUngeschaetzt() }}</td>
        <td>{{ statistikenService.summeAlleBucketsGesamt() }}</td>
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
import {useStatistikenStore} from "@/stores/statistikenService";
import {useKonfigContainer} from "@/stores/konfigContainer";
import type {Statistik} from "@/models/Statistik";

const statistikenService = useStatistikenStore();
const konfigContainer = useKonfigContainer();
statistikenService.berechne();

function minBucketmodus(statistik: Statistik) {
  if (statistik.min != null) {
    return Number(statistik.min).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function maxBucketmodus(statistik: Statistik) {
  if (statistik.max != null) {
    return Number(statistik.max).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function durchschnittBucketmodus(statistik: Statistik) {
  if (statistik.durchschnitt != null) {
    return Number(statistik.durchschnitt).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function medianBucketmodus(statistik: Statistik) {
  if (statistik.median != null) {
    return Number(statistik.median).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function schaetzungenSummeBucketmodusPT(statistik: Statistik) {
  if (statistik.summeSchaetzungen != null) {
    return Number(statistik.summeSchaetzungen).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function schaetzungenSummeBucketmodusProzent(statistik: Statistik) {
  const summeSchaetzunSumme = statistikenService.summeAlleBucketsSchaetzungenSumme();
  if (summeSchaetzunSumme == null || statistik.anzahlGeschaetzt == 0) {
    return "";
  } else {
    if (summeSchaetzunSumme == 0) {
      return "0%";
    } else {
      return Number((statistik.summeSchaetzungen! / summeSchaetzunSumme * 100)).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen }) + "%";
    }
  }

}

function durchschnittSummeBucketmodusPT(statistik: Statistik) {
  if (statistik.summeDurchschnitt != null) {
    return Number(statistik.summeDurchschnitt).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function durchschnittSummeBucketmodusProzent(statistik: Statistik) {
  const summeDurchschnittSumme = statistikenService.summeAlleBucketsDurchschnittSumme();
  if (summeDurchschnittSumme == null || statistik.anzahlGeschaetzt == 0) {
    return "";
  } else {
    if (summeDurchschnittSumme == 0) {
      return "0%";
    } else {
      return Number((statistik.summeDurchschnitt! / summeDurchschnittSumme * 100)).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen }) + "%";
    }
  }
}

function medianSummeBucketmodusPT(statistik: Statistik) {
  if (statistik.summeMedian != null) {
    return Number(statistik.summeMedian).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  }
  return "";
}

function medianSummeBucketmodusProzent(statistik: Statistik) {
  const summeMedianSumme = statistikenService.summeAlleBucketsMedianSumme();
  if (summeMedianSumme == null || statistik.anzahlGeschaetzt == 0) {
    return "";
  } else {
    if (summeMedianSumme == 0) {
      return "0%";
    } else {
      return Number((statistik.summeMedian! / summeMedianSumme * 100)).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen }) + "%";
    }
  }
}

function minSumme() {
  const summeMin = statistikenService.summeAlleBucketsMin();
  if (summeMin != null) {
    return Number(summeMin).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  } else return "";
}

function maxSumme() {
  const summeMax = statistikenService.summeAlleBucketsMax();
  if (summeMax != null) return Number(summeMax).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  else return "";
}

function durchschnittSumme() {
  const summeDurchschnitt = statistikenService.summeAlleBucketsDurchschnitt();
  if (summeDurchschnitt != null) return Number(summeDurchschnitt).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  else return "";
}

function medianSumme() {
  const summeMedian = statistikenService.summeAlleBucketsMedian();
  if (summeMedian != null) return Number(summeMedian).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  else return "";
}

function summeSchaetzungenSumme() {
  const summeSchaetzungen = statistikenService.summeAlleBucketsSchaetzungenSumme();
  if (summeSchaetzungen != null) return Number(summeSchaetzungen).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  else return "";
}

function summeDurchschnittSumme() {
  const summeDurchschnitt = statistikenService.summeAlleBucketsDurchschnittSumme();
  if (summeDurchschnitt != null) return Number(summeDurchschnitt).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  else return "";
}

function summeMedianSumme() {
  const summeMedian = statistikenService.summeAlleBucketsMedianSumme();
  if (summeMedian != null) return Number(summeMedian).toLocaleString('de', { minimumFractionDigits: konfigContainer.nachkommastellen, maximumFractionDigits: konfigContainer.nachkommastellen });
  else return "";
}

</script>

<style scoped>
table, th, td {
  border: 1px solid;
  text-align: center !important;
  empty-cells: show;
}
</style>