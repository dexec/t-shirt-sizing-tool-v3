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
        <tr
            v-for="bucket in buckets"
            :key="bucket.name"
        >
          <td>{{ bucket.name }}</td>
          <td>{{ bucket.anzahlGeschaetzt }}</td>
          <td>{{ bucket.anzahlUngeschaetzt }}</td>
          <td>{{ bucket.min }}</td>
          <td>{{ bucket.max }}</td>
          <td>{{ bucket.mittelwert }}</td>
          <td>{{ bucket.anteilAnzahl }}</td>
          <td>{{ bucket.summeSchaetzungen.pt }}</td>
          <td>{{ bucket.summeSchaetzungen.prozent }}</td>
          <td>{{ bucket.durschnittlicheSumme.pt }}</td>
          <td>{{ bucket.durschnittlicheSumme.prozent }}</td>
          <td>{{ bucket.summeNachMedian.pt }}</td>
          <td>{{ bucket.summeNachMedian.prozent }}</td>
        </tr>
        <tr class="font-weight-bold">
          <td>Summe</td>
          <td>4</td>
          <td>0</td>
          <td>5</td>
          <td></td>
          <td></td>
          <td></td>
          <td colspan="2">20</td>
          <td colspan="2">20</td>
          <td colspan="2">20</td>
        </tr>
        </tbody>
      </template>
    </v-table>
    <v-icon
        size="large"
        color="green-darken-2"
    >
      mdi-domain
    </v-icon>
  </div>
</template>

<script>
export default {
  name: "BucketUebersichtView",
  data() {
    return {
      buckets: [
        {
          name: 'xs',
          anzahlGeschaetzt: 1,
          anzahlUngeschaetzt: 0,
          anzahlGesamt: 1,
          min: 5,
          max: 5,
          mittelwert: 5,
          median: 5,
          anteilAnzahl: 11.11,
          summeSchaetzungen: {pt: 5, prozent: 3.25},
          durschnittlicheSumme: {pt: 5, prozent: 3.09},
          summeNachMedian: {pt: 5, prozent: 3.14}
        },
        {
          name: 's',
          anzahlGeschaetzt: 1,
          anzahlUngeschaetzt: 0,
          anzahlGesamt: 1,
          min: 5,
          max: 5,
          mittelwert: 5,
          median: 5,
          anteilAnzahl: 11.11,
          summeSchaetzungen: {pt: 5, prozent: 3.25},
          durschnittlicheSumme: {pt: 5, prozent: 3.09},
          summeNachMedian: {pt: 5, prozent: 3.14}
        },
        {
          name: 'm',
          anzahlGeschaetzt: 1,
          anzahlUngeschaetzt: 0,
          anzahlGesamt: 1,
          min: 5,
          max: 5,
          mittelwert: 5,
          median: 5,
          anteilAnzahl: 11.11,
          summeSchaetzungen: {pt: 5, prozent: 3.25},
          durschnittlicheSumme: {pt: 5, prozent: 3.09},
          summeNachMedian: {pt: 5, prozent: 3.14}
        },
        {
          name: 'xl',
          anzahlGeschaetzt: 1,
          anzahlUngeschaetzt: 0,
          anzahlGesamt: 1,
          min: 5,
          max: 5,
          mittelwert: 5,
          median: 5,
          anteilAnzahl: 11.11,
          summeSchaetzungen: {pt: 5, prozent: 3.25},
          durschnittlicheSumme: {pt: 5, prozent: 3.09},
          summeNachMedian: {pt: 5, prozent: 3.14}
        }
      ]
    }
  }
}
</script>

<style>
table, th, td {
  border: 1px solid;
  text-align: center !important;
  empty-cells: show;
}
</style>