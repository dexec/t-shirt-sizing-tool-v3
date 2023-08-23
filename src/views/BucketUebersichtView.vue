<template>
  <div>
    <v-table>
      <template v-slot:default>
        <thead>
        <tr>
          <th v-if="projektStore.bucketmodus" rowspan="2">Bucket</th>
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
        <tr v-if="projektStore.bucketmodus">
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
          <td>{{ statistik.anzahlGeschaetzt }}</td>
          <td>{{ statistik.anzahlUngeschaetzt }}</td>
          <td>{{ statistik.anzahlGesamt }}</td>
          <td>{{ statistik.min }}</td>
          <td>{{ statistik.max }}</td>
          <td>{{ statistik.anteilAnzahl * 100 + "%" }}</td>
          <td>{{ statistik.durchschnitt }}</td>
          <td>{{ statistik.median }}</td>
          <td>{{ statistik.summeSchaetzungen }}</td>
          <td>
            {{
              statistiken.summeAlleBucketsSchaetzungenSumme() == null || statistik.anzahlGeschaetzt==0 ? "" : Math.round(statistik.summeSchaetzungen / statistiken.summeAlleBucketsSchaetzungenSumme()*100) + "%"
            }}
          </td>
          <td>{{ statistik.summeDurchschnitt }}</td>
          <td>
            {{
              statistiken.summeAlleBucketsDurchschnittSumme() == null ||statistik.anzahlGeschaetzt==0 ? "" : Math.round(statistik.summeDurchschnitt / statistiken.summeAlleBucketsDurchschnittSumme()*100) + "%"
            }}
          </td>
          <td>{{ statistik.summeMedian }}</td>
          <td>
            {{
              statistiken.summeAlleBucketsMedianSumme() == null || statistik.anzahlGeschaetzt ==0? "" : Math.round(statistik.summeMedian / statistiken.summeAlleBucketsMedianSumme()*100) + "%"
            }}
          </td>
        </tr>
        <!--        TODO Keine Summenreihe, wenn bucketmodus aber keine Buckets definiert sind.
                Dann lieber Nachricht, dass man Buckets definieren sollte-->
        <tr class="font-weight-bold">
          <td v-if="projektStore.bucketmodus">Summe</td>
          <td>{{ statistiken.summeAlleBucketsGeschaetzt() }}</td>
          <td>{{ statistiken.summeAlleBucketsUngeschaetzt() }}</td>
          <td>{{ statistiken.summeAlleBucketsGesamt() }}</td>
          <td>{{ statistiken.summeAlleBucketsMin() }}</td>
          <td>{{ statistiken.summeAlleBucketsMax() }}</td>
          <td>100%</td>
          <td>{{ projektStore.bucketmodus ? "" : statistiken.summeAlleBucketsDurchschnitt() }}</td>
          <td>{{ projektStore.bucketmodus ? "" : statistiken.summeAlleBucketsMedian() }}</td>
          <td colspan="2">{{ statistiken.summeAlleBucketsSchaetzungenSumme() }}</td>
          <td colspan="2">{{ statistiken.summeAlleBucketsDurchschnittSumme() }}</td>
          <td colspan="2">{{ statistiken.summeAlleBucketsMedianSumme() }}</td>
        </tr>
        </tbody>
      </template>
    </v-table>
  </div>
</template>

<script lang="ts" setup>
import { useStatistikenStore } from "@/stores/statistiken";
import { useProjektStore } from "@/stores/projekt";

const statistiken = useStatistikenStore();
const projektStore = useProjektStore();
statistiken.berechne();
</script>

<style scoped>
table, th, td {
  border: 1px solid;
  text-align: center !important;
  empty-cells: show;
}
</style>