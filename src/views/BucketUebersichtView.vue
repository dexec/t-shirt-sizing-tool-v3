<template>
  <div>
    <v-table>
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
          <th colspan="2">Summe nach Median</th>
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
          <td>{{ statistik.anzahlGeschaetzt }}</td>
          <td>{{ statistik.anzahlUngeschaetzt }}</td>
          <td>{{ statistik.anzahlGesamt }}</td>
          <td>{{ statistik.min }}</td>
          <td>{{ statistik.max }}</td>
          <td>{{ statistik.anteilAnzahl !== 0 ? Math.round(statistik.anteilAnzahl * 100) + "%" : '' }}</td>
          <td>{{ statistik.durchschnitt !== 0 ? Math.round(statistik.durchschnitt) : '' }}</td>
          <td>{{ statistik.median !== 0 ? Math.round(statistik.median) : '' }}</td>
          <td>{{ statistik.summeSchaetzungen !== 0 ? statistik.summeSchaetzungen : '' }}</td>
          <td>
            {{
              statistik.summeSchaetzungen !== 0 ? Math.round((statistik.summeSchaetzungen / statistiken.summeAlleBucketsSchaetzungenSumme() || 0) * 100) + '%' : ''
            }}
          </td>
          <td>{{ statistik.summeDurchschnitt !== 0 ? Math.round(statistik.summeDurchschnitt) : '' }}</td>
          <td>
            {{
              statistik.summeDurchschnitt !== 0 ? Math.round((statistik.summeDurchschnitt / statistiken.summeAlleBucketsDurchschnittSumme() || 0) * 100) + '%' : ''
            }}
          </td>
          <td>{{ statistik.summeMedian !== 0 ? Math.round(statistik.summeMedian) : '' }}</td>
          <td>
            {{
              statistik.summeMedian !== 0 ? Math.round((statistik.summeMedian / statistiken.summeAlleBucketsMedianSumme() || 0) * 100) + '%' : ''
            }}
          </td>
        </tr>
        <tr class="font-weight-bold">
          <td>Summe</td>
          <td>{{ statistiken.summeAlleBucketsGeschaetzt() }}</td>
          <td>{{ statistiken.summeAlleBucketsUngeschaetzt() }}</td>
          <td>{{ statistiken.summeAlleBucketsGesamt() }}</td>
          <td>{{ statistiken.summeAlleBucketsMin() }}</td>
          <td>{{ statistiken.summeAlleBucketsMax() }}</td>
          <td>100%</td>
          <td>{{ projektStore.bucketmodus ? '' : statistiken.summeAlleBucketsDurchschnitt() }}</td>
          <td>{{ projektStore.bucketmodus ? '' : statistiken.summeAlleBucketsMedian() }}</td>
          <td colspan="2">{{ Math.round(statistiken.summeAlleBucketsSchaetzungenSumme()) }}</td>
          <td colspan="2">{{ Math.round(statistiken.summeAlleBucketsDurchschnittSumme()) }}</td>
          <td colspan="2">{{ Math.round(statistiken.summeAlleBucketsMedianSumme()) }}</td>
        </tr>
        </tbody>
      </template>
    </v-table>
  </div>
</template>

<script lang="ts" setup>
import {useStatistikenStore} from "@/stores/statistiken";
import {useProjektStore} from "@/stores/projekt";

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