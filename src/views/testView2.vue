<template>
  <div class="result-table">
    <button class="download-btn" type="button" v-on:click="download">Download</button>
  </div>
  <div class="result-table">
    <button class="download-btn" type="button" v-on:click="testfunction">Test</button>
  </div>
</template>

<style scoped>
.result-table {
  width: 50%;
  text-align: center;
}

.download-btn {
  background-color: DodgerBlue;
  border: none;
  color: white;
  padding: 12px 30px;
  margin: 12px 0;
  cursor: pointer;
  font-size: 20px;
}

/* Darker background on mouse-over */
.download-btn:hover {
  background-color: RoyalBlue;
}
</style>

<script lang="ts" setup>
import XLSX from 'xlsx';
import {usePaketeStore} from "@/stores/pakete";
import {useBucketsStore} from "@/stores/buckets";
import type {Bucket} from "@/Bucket";
import type {Paket} from "@/Paket";
import type {Statistik} from "@/Statistik";
import {useStatistikenStore} from "@/stores/statistiken";

interface SerializablePaket {
  ticket_nr: string,
  thema: string,
  beschreibung: string,
  komponente: string,
  bucket: string | null,
  schaetzung: number | null
}

interface SerializableStatistik {
  bucket: string,
  anzahlGeschaetzt: number
  anzahlUngeschaetzt: number
  anzahlGesamt: number
  min: number
  max: number
  median: number
  durchschnitt: number
  anteilAnzahl: number
  summeSchaetzungenPT: number
  summeSchaetzungenProzent: number
  summeDurchschnittPT: number
  summeDurchschnittProzent: number
  summeMedianPT: number
  summeMedianProzent: number
}

const headersForPakete = ["Ticket-Nr", "Thema", "Beschreibung", "Komponente", "Bucket", "Schätzung"]
const headersForStatistiken = [
  "Bucket",
  "Anzahl geschätzt",
  "Anzahl ungeschätzt",
  "Anzahl gesamt",
  "Min",
  "Max",
  "Anteil Anzahl",
  "Mittelwert",
  "Median",
  "Summe Schätzungen",
    "",
  "Durchschnittliche Summe",
    "",
  "Mediane Summe",
""];
const paketeStore = usePaketeStore();
const bucketStore = useBucketsStore();
const statistikenStore = useStatistikenStore();

function download() {

  const wb = XLSX.utils.book_new()
  createSheetForStatistiken(wb, statistikenStore.statistiken as Statistik[]);
  createSheetForPakete(wb, paketeStore.paketeAsFlatView(), "Alle Pakete");
  createSheetForPakete(wb, paketeStore.paketeChildrenWithNoBucket(), "Alle Pakete ohne Bucket");
  createSheetsForBuckets(wb, paketeStore.unsortedPaketeListsSortedByBucketsMap);
  XLSX.writeFile(wb, 'demo.xlsx')

}

async function createSheetForPakete(wb: XLSX.WorkBook, pakete: Paket[], sheetName: string) {
  const arraySerializablePaket: SerializablePaket[] = []
  for (const paket of pakete) {
    const serializablePaket: SerializablePaket = {
      ticket_nr: paket.ticket_nr,
      thema: paket.thema,
      beschreibung: paket.beschreibung,
      komponente: paket.komponente,
      bucket: paket.bucket?.name ?? null,
      schaetzung: paket.schaetzung ?? null
    }
    for (let i = 0; i < paket.lvl; i++) {
      serializablePaket.ticket_nr = "   " + serializablePaket.ticket_nr
    }
    arraySerializablePaket.push(serializablePaket);
  }
  const sheetPakete = XLSX.utils.json_to_sheet(arraySerializablePaket, {
    origin: "A2",
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, [headersForPakete], {
    origin: "A1",
    skipHeader: true,
    cellStyles: true
  })
  XLSX.utils.book_append_sheet(wb, sheetPakete, sheetName);
}

function createSheetsForBuckets(wb: XLSX.WorkBook, map: Map<Bucket, Paket[]>) {
  map.forEach((value, key) => {
    const arraySerializablePaket: SerializablePaket[] = []
    for (const paket of value) {
      const serializablePaket: SerializablePaket = {
        ticket_nr: paket.ticket_nr,
        thema: paket.thema,
        beschreibung: paket.beschreibung,
        komponente: paket.komponente,
        bucket: paket.bucket?.name ?? null,
        schaetzung: paket.schaetzung ?? null
      }
      arraySerializablePaket.push(serializablePaket);
    }
    const sheetBucket = XLSX.utils.json_to_sheet(arraySerializablePaket, {origin: "A2", skipHeader: true});
    XLSX.utils.sheet_add_json(sheetBucket, [headersForPakete], {origin: "A1", skipHeader: true})
    XLSX.utils.book_append_sheet(wb, sheetBucket, "Bucket " + key.name);
  })
}

function createSheetForStatistiken(wb: XLSX.WorkBook, statistiken: Statistik[]) {
  const arraySerializableStatistik: SerializableStatistik[] = [];
  for (const statistik of statistiken) {
    const serializableStatistik: SerializableStatistik = {
      bucket: statistik.bucket.name,
      anzahlGeschaetzt: statistik.anzahlGeschaetzt,
      anzahlUngeschaetzt: statistik.anzahlUngeschaetzt,
      anzahlGesamt: statistik.anzahlGesamt,
      min: statistik.min,
      max: statistik.max,
      median: statistik.median,
      durchschnitt: statistik.durchschnitt,
      anteilAnzahl: statistik.anteilAnzahl,
      summeSchaetzungenPT: statistik.summeSchaetzungen,
      summeSchaetzungenProzent: Math.round((statistik.summeSchaetzungen / statistikenStore.summeAlleBucketsSchaetzungenSumme() || 0) * 100),
      summeDurchschnittPT: statistik.summeDurchschnitt,
      summeDurchschnittProzent: Math.round((statistik.summeDurchschnitt / statistikenStore.summeAlleBucketsDurchschnittSumme() || 0) * 100),
      summeMedianPT: statistik.summeMedian,
      summeMedianProzent: Math.round((statistik.summeMedian / statistikenStore.summeAlleBucketsMedianSumme() || 0) * 100)
    }
    arraySerializableStatistik.push(serializableStatistik);
  }
  const sheetStatistiken = XLSX.utils.json_to_sheet(arraySerializableStatistik, {origin: "A3", skipHeader: true})
  XLSX.utils.sheet_add_json(sheetStatistiken, [headersForStatistiken], {origin: "A1", skipHeader: true})
  if(!sheetStatistiken["!merges"]) {
    sheetStatistiken["!merges"] = [];
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("A1:A2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("B1:B2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("C1:C2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("D1:D2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("E1:E2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("F1:F2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("G1:G2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("H1:H2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("I1:I2"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("J1:K1"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("L1:M1"))
    sheetStatistiken["!merges"]?.push(XLSX.utils.decode_range("N1:O1"))
  }
  XLSX.utils.sheet_add_json(sheetStatistiken,[["PT","%","PT","%","PT","%"]],{origin:"J2",skipHeader:true})
  XLSX.utils.book_append_sheet(wb, sheetStatistiken, "Statistiken");
}

async function testfunction() {
    /* Extract VBA Blob from test file */
    const url = "https://docs.sheetjs.com/vba/SheetJSVBAFormula.xlsm";
    const raw_data = await (await fetch(url)).arrayBuffer();
    const blob = XLSX.read(raw_data, {bookVBA: true}).vbaraw;

    /* generate worksheet and workbook */
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["Cell", "A1", "RC"],
      [
        {t:"n", f:"LEN(A1)"},      // A2
        {t:"s", f:"GetFormulaA1(A2)"},  // B2
        {t:"s", f:"GetFormulaRC(A2)"}   // C2
      ]
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    /* add VBA blob to new workbook */
    workbook.vbaraw = blob;

    /* create an XLSM file and try to save to SheetJSVBANeu.xlsm */
    XLSX.writeFile(workbook, "SheetJSVBANeu.xlsm", { bookVBA: true });
}
</script>
