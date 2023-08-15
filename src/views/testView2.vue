<template>
  <div class="result-table">
    <button class="download-btn" type="button" v-on:click="download">Download</button>
  </div>
  <div class="result-table">
    <button class="download-btn" type="button" v-on:click="testfunction(paketeStore.paketeFullTreeView())">Test</button>
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
import { usePaketeStore } from "@/stores/pakete";
import { useBucketsStore } from "@/stores/buckets";
import type { Bucket } from "@/Bucket";
import { Paket } from "@/Paket";
import type { Statistik } from "@/Statistik";
import { useStatistikenStore } from "@/stores/statistiken";
import type { WorkBook, WorkSheet } from "xlsx-js-style";
import * as XLSX from "xlsx-js-style";
import { useProjektStore } from "@/stores/projekt";
import type { AbstrakterEintrag } from "@/AbstrakterEintrag";
import { useEintraegeStore } from "@/stores/eintraege";
import { Eintrag } from "@/Eintrag";
import { Zwischensumme } from "@/Zwischensumme";

const paketeStore = usePaketeStore();
const bucketStore = useBucketsStore();
const statistikenStore = useStatistikenStore();
const projektStore = useProjektStore();
const eintraegeStore = useEintraegeStore();
statistikenStore.berechne();
eintraegeStore.berechne();

function download() {
  const wb = XLSX.utils.book_new();
  const sheetKalkulation = createSheetForKalkulation(statistikenStore.statistiken as Statistik[], eintraegeStore.eintraege as AbstrakterEintrag[], projektStore.bucketmodus);
  const sheetAllePakete = createSheetForPakete(paketeStore.paketeFullTreeView(), projektStore.bucketmodus);
  XLSX.utils.book_append_sheet(wb, sheetKalkulation, "Projektkalkulation");
  XLSX.utils.book_append_sheet(wb, sheetAllePakete, "Alle Pakete");
  if (projektStore.bucketmodus) {
    const sheetAllePaketeOhneBucket = createSheetForAllePaketeOhneBucket(paketeStore.paketeChildrenWithNoBucket());
    XLSX.utils.book_append_sheet(wb, sheetAllePaketeOhneBucket, "Alle Pakete ohne Bucket");
    createSheetsForBuckets(wb, paketeStore.unsortedPaketeListsSortedByBucketsMap);
  }
  XLSX.writeFile(wb, "demo.xlsx");
}

function createSheetForPakete(pakete: Paket[], bucketmodus: boolean) {
  if (bucketmodus) return createSheetForPaketeBucketmodus(pakete);
  else return createSheetForPaketeBucketlosermodus(pakete);
}

function createSheetForPaketeBucketmodus(pakete: Paket[]) {
  interface SerializablePaket {
    lvl:string,
    ticket_nr: string,
    thema: string,
    beschreibung: string,
    komponente: string,
    bucket: string | null,
    schaetzung: number | null
  }
  const headersForPakete = ["Hierarchie", "Ticket-Nr", "Thema", "Beschreibung", "Komponente", "Bucket", "Schätzung"];
  const arraySerializablePaket: SerializablePaket[] = [];
  let lastLvl = 0;
  let currentHierarchy = "";
  for (const paket of pakete) {
    if(currentHierarchy=="") currentHierarchy="1"
    else if (paket.lvl > lastLvl) {
      currentHierarchy += ".1";
    }
    else if (paket.lvl < lastLvl) {
      currentHierarchy = currentHierarchy.slice(0, currentHierarchy.length - 2);
      let currentHierarchyLastDigit = parseInt(currentHierarchy.charAt(currentHierarchy.length-1));
      currentHierarchyLastDigit++;
      currentHierarchy = currentHierarchy.slice(0,currentHierarchy.length-1)
      currentHierarchy += currentHierarchyLastDigit
    }
    else if (paket.lvl == lastLvl) {
      let currentHierarchyLastDigit = parseInt(currentHierarchy.charAt(currentHierarchy.length-1));
      currentHierarchyLastDigit++;
      currentHierarchy=currentHierarchy.slice(0,currentHierarchy.length-1)
      currentHierarchy += currentHierarchyLastDigit
    }
    lastLvl=paket.lvl;
    const serializablePaket: SerializablePaket = {
      lvl:currentHierarchy,
      ticket_nr: paket.ticket_nr,
      thema: paket.thema,
      beschreibung: paket.beschreibung,
      komponente: paket.komponente,
      bucket: paket.bucket?.name ?? null,
      schaetzung: paket.schaetzung ?? null
    };
    for (let i = 0; i < paket.lvl; i++) {
      serializablePaket.ticket_nr = "   " + serializablePaket.ticket_nr;
    }
    arraySerializablePaket.push(serializablePaket);
  }
  const sheetPakete = XLSX.utils.json_to_sheet([], {
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, arraySerializablePaket, {
    origin: "A2",
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, [headersForPakete], {
    origin: "A1",
    skipHeader: true,
    cellStyles: true
  });
  return sheetPakete;
}

function createSheetForPaketeBucketlosermodus(pakete: Paket[]) {
  interface SerializablePaket {
    lvl: string,
    ticket_nr: string,
    thema: string,
    beschreibung: string,
    komponente: string,
    schaetzung: number | null
  }

  const headersForPakete = ["Hierarchie", "Ticket-Nr", "Thema", "Beschreibung", "Komponente", "Schätzung"];
  const arraySerializablePaket: SerializablePaket[] = [];
  let lastLvl = 0;
  let currentHierarchy = "";
  for (const paket of pakete) {
    if(currentHierarchy=="") currentHierarchy="1"
    else if (paket.lvl > lastLvl) {
      currentHierarchy += ".1";
    }
    else if (paket.lvl < lastLvl) {
      currentHierarchy = currentHierarchy.slice(0, currentHierarchy.length - 2);
      let currentHierarchyLastDigit = parseInt(currentHierarchy.charAt(currentHierarchy.length-1));
      currentHierarchyLastDigit++;
      currentHierarchy = currentHierarchy.slice(0,currentHierarchy.length-1)
      currentHierarchy += currentHierarchyLastDigit
    }
    else if (paket.lvl == lastLvl) {
      let currentHierarchyLastDigit = parseInt(currentHierarchy.charAt(currentHierarchy.length-1));
      currentHierarchyLastDigit++;
      currentHierarchy=currentHierarchy.slice(0,currentHierarchy.length-1)
      currentHierarchy += currentHierarchyLastDigit
    }
    lastLvl=paket.lvl;
    const serializablePaket: SerializablePaket = {
      lvl:currentHierarchy,
      ticket_nr: paket.ticket_nr,
      thema: paket.thema,
      beschreibung: paket.beschreibung,
      komponente: paket.komponente,
      schaetzung: paket.schaetzung ?? null
    };
    for (let i = 0; i < paket.lvl; i++) {
      serializablePaket.ticket_nr = "   " + serializablePaket.ticket_nr;
    }
    arraySerializablePaket.push(serializablePaket);
  }
  const sheetPakete = XLSX.utils.json_to_sheet([], {
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, arraySerializablePaket, {
    origin: "A2",
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, [headersForPakete], {
    origin: "A1",
    skipHeader: true,
    cellStyles: true
  });
  return sheetPakete;
}

function createSheetForAllePaketeOhneBucket(pakete:Paket[]) {
  interface SerializablePaket {
    ticket_nr: string,
    thema: string,
    beschreibung: string,
    komponente: string,
    schaetzung: number | null
  }
  const headersForPakete = ["Ticket-Nr", "Thema", "Beschreibung", "Komponente", "Schätzung"];
  const arraySerializablePaket: SerializablePaket[] = [];
  for(const paket of pakete) {
    const serializablePaket: SerializablePaket = {
      ticket_nr: paket.ticket_nr,
      thema: paket.thema,
      beschreibung: paket.beschreibung,
      komponente: paket.komponente,
      schaetzung: paket.schaetzung ?? null
    };
    arraySerializablePaket.push(serializablePaket);
  }
  const sheetPakete = XLSX.utils.json_to_sheet([], {
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, arraySerializablePaket, {
    origin: "A2",
    skipHeader: true,
    cellStyles: true
  });
  XLSX.utils.sheet_add_json(sheetPakete, [headersForPakete], {
    origin: "A1",
    skipHeader: true,
    cellStyles: true
  });
  return sheetPakete;
}
function createSheetsForBuckets(wb: WorkBook, map: Map<Bucket, Paket[]>) {
  interface SerializablePaket {
    ticket_nr: string,
    thema: string,
    beschreibung: string,
    komponente: string,
    schaetzung: number | null
  }

  const headersForPakete = ["Ticket-Nr", "Thema", "Beschreibung", "Komponente", "Schätzung"];
  map.forEach((value, key) => {
    const arraySerializablePaket: SerializablePaket[] = [];
    for (const paket of value) {
      const serializablePaket: SerializablePaket = {
        ticket_nr: paket.ticket_nr,
        thema: paket.thema,
        beschreibung: paket.beschreibung,
        komponente: paket.komponente,
        schaetzung: paket.schaetzung ?? null
      };
      arraySerializablePaket.push(serializablePaket);
    }
    const sheetBucket = XLSX.utils.json_to_sheet([], { skipHeader: true });
    XLSX.utils.sheet_add_json(sheetBucket, arraySerializablePaket, { origin: "A2", skipHeader: true });
    XLSX.utils.sheet_add_json(sheetBucket, [headersForPakete], { origin: "A1", skipHeader: true });
    XLSX.utils.book_append_sheet(wb, sheetBucket, "Bucket " + key.name);
  });
}

function createSheetForKalkulation(statistiken: Statistik[], eintraege: AbstrakterEintrag[], bucketmodus: boolean) {
  const sheetKalkulation = XLSX.utils.json_to_sheet([], { skipHeader: true });
  const anzahlZeilenStatistiken = addStatistikenToSheet(sheetKalkulation, statistiken, bucketmodus);
  addEintraegeToSheet(sheetKalkulation, eintraege, anzahlZeilenStatistiken+4);
  return sheetKalkulation;
}

function addStatistikenToSheet(sheet: WorkSheet, statistiken: Statistik[], bucketmodus: boolean) {
  if (bucketmodus) return addStatistikenToSheetBucketmodus(sheet, statistiken);
  else return addStatistikenToSheetBucketlosermodus(sheet);
}

function addStatistikenToSheetBucketmodus(sheet: WorkSheet, statistiken: Statistik[]) {
  interface SerializableStatistik {
    bucket: string,
    anzahlGeschaetzt: number
    anzahlUngeschaetzt: number
    anzahlGesamt: number
    min: number
    max: number
    anteilAnzahl: number
    durchschnitt: number | null
    median: number | null
    summeSchaetzungenPT: number
    summeSchaetzungenProzent: number | null
    summeDurchschnittPT: number
    summeDurchschnittProzent: number | null
    summeMedianPT: number
    summeMedianProzent: number | null
  }

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
  const arraySerializableStatistik: SerializableStatistik[] = [];
  for (const statistik of statistiken) {
    const serializableStatistik: SerializableStatistik = {
      bucket: statistik.bucket.name,
      anzahlGeschaetzt: statistik.anzahlGeschaetzt,
      anzahlUngeschaetzt: statistik.anzahlUngeschaetzt,
      anzahlGesamt: statistik.anzahlGesamt,
      min: statistik.min,
      max: statistik.max,
      anteilAnzahl: statistik.anteilAnzahl,
      durchschnitt: statistik.durchschnitt,
      median: statistik.median,
      summeSchaetzungenPT: statistik.summeSchaetzungen,
      summeSchaetzungenProzent: statistik.summeSchaetzungen / statistikenStore.summeAlleBucketsSchaetzungenSumme() || 0,
      summeDurchschnittPT: statistik.summeDurchschnitt,
      summeDurchschnittProzent: statistik.summeDurchschnitt / statistikenStore.summeAlleBucketsDurchschnittSumme() || 0,
      summeMedianPT: statistik.summeMedian,
      summeMedianProzent: statistik.summeMedian / statistikenStore.summeAlleBucketsMedianSumme() || 0
    };
    arraySerializableStatistik.push(serializableStatistik);
  }

  const summeStatistiken: SerializableStatistik = {
    bucket: "Summe",
    anzahlGeschaetzt: statistikenStore.summeAlleBucketsGeschaetzt(),
    anzahlUngeschaetzt: statistikenStore.summeAlleBucketsUngeschaetzt(),
    anzahlGesamt: statistikenStore.summeAlleBucketsGesamt(),
    min: statistikenStore.summeAlleBucketsMin(),
    max: statistikenStore.summeAlleBucketsMax(),
    anteilAnzahl: 1,
    durchschnitt: null,
    median: null,
    summeSchaetzungenPT: statistikenStore.summeAlleBucketsSchaetzungenSumme(),
    summeSchaetzungenProzent: null,
    summeDurchschnittPT: statistikenStore.summeAlleBucketsDurchschnittSumme(),
    summeDurchschnittProzent: null,
    summeMedianPT: statistikenStore.summeAlleBucketsMedianSumme(),
    summeMedianProzent: null
  };
  arraySerializableStatistik.push(summeStatistiken);
  XLSX.utils.sheet_add_json(sheet, arraySerializableStatistik, { origin: "A3", skipHeader: true });
  XLSX.utils.sheet_add_json(sheet, [headersForStatistiken], { origin: "A1", skipHeader: true });
  sheet[XLSX.utils.encode_cell({ r: arraySerializableStatistik.length + 1, c: 6 })].z = "0.00%";
  for (let i = 0; i < arraySerializableStatistik.length - 1; i++) {
    sheet[XLSX.utils.encode_cell({ r: i + 2, c: 6 })].z = "0.00%";
    sheet[XLSX.utils.encode_cell({ r: i + 2, c: 10 })].z = "0.00%";
    sheet[XLSX.utils.encode_cell({ r: i + 2, c: 12 })].z = "0.00%";
    sheet[XLSX.utils.encode_cell({ r: i + 2, c: 14 })].z = "0.00%";
    const sheetName = "Bucket " + arraySerializableStatistik[i].bucket;
    XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
      r: i + 2,
      c: 1
    }), "COUNTIF('" + sheetName + "'!E:E,\"<>\")-1");
    XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
      r: i + 2,
      c: 2
    }), "COUNTIF('" + sheetName + "'!A:A,\"<>\")-COUNTIF('" + sheetName + "'!E:E,\"<>\")");
    XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({r: i + 2, c: 3}), "B" + (i + 3) + "+C" + (i + 3));
  }

  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 1
  }), "SUM(B3:B" + (arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 2
  }), "SUM(C3:C" + (arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 3
  }), "SUM(D3:D" + (arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 4
  }), "MIN(IF(E3:E" + (arraySerializableStatistik.length + 1) + "<>0, E3:E" + (arraySerializableStatistik.length + 1) + "))");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 5
  }), "MAX(F3:F" + (arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 6
  }), "SUM(G3:G"+(arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 9
  }), "SUM(J3:J" + (arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 11
  }), "SUM(L3:L" + (arraySerializableStatistik.length + 1) + ")");
  XLSX.utils.sheet_set_array_formula(sheet, XLSX.utils.encode_cell({
    r: arraySerializableStatistik.length + 1,
    c: 13
  }), "SUM(N3:N" + (arraySerializableStatistik.length + 1) + ")");
  if (!sheet["!merges"]) {
    sheet["!merges"] = [];
    sheet["!merges"]?.push(XLSX.utils.decode_range("A1:A2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("B1:B2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("C1:C2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("D1:D2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("E1:E2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("F1:F2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("G1:G2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("H1:H2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("I1:I2"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("J1:K1"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("L1:M1"));
    sheet["!merges"]?.push(XLSX.utils.decode_range("N1:O1"));
    sheet["!merges"]?.push(XLSX.utils.decode_range(XLSX.utils.encode_cell({
      r: arraySerializableStatistik.length + 1,
      c: 9
    }) + ":" + XLSX.utils.encode_cell({ r: arraySerializableStatistik.length + 1, c: 10 })));
    sheet["!merges"]?.push(XLSX.utils.decode_range(XLSX.utils.encode_cell({
      r: arraySerializableStatistik.length + 1,
      c: 11
    }) + ":" + XLSX.utils.encode_cell({ r: arraySerializableStatistik.length + 1, c: 12 })));
    sheet["!merges"]?.push(XLSX.utils.decode_range(XLSX.utils.encode_cell({
      r: arraySerializableStatistik.length + 1,
      c: 13
    }) + ":" + XLSX.utils.encode_cell({ r: arraySerializableStatistik.length + 1, c: 14 })));
  }
  XLSX.utils.sheet_add_json(sheet, [["PT", "%", "PT", "%", "PT", "%"]], { origin: "J2", skipHeader: true });
  return arraySerializableStatistik.length;
}

function addStatistikenToSheetBucketlosermodus(sheet: WorkSheet) {
  interface SerializableStatistik {
    anzahlGeschaetzt: number;
    anzahlUngeschaetzt: number;
    anzahlGesamt: number;
    min: number;
    max: number;
    anteilAnzahl: number;
    durchschnitt: number;
    median: number;
    summeSchaetzungen: number;
    summeDurchschnitt: number;
    summeMedian: number;
  }

  const headersForStatistiken = [
    "Anzahl geschätzt",
    "Anzahl ungeschätzt",
    "Anzahl gesamt",
    "Min",
    "Max",
    "Anteil Anzahl",
    "Mittelwert",
    "Median",
    "Summe Schätzungen",
    "Durchschnittliche Summe",
    "Mediane Summe"];
  const arraySerializableStatistik: SerializableStatistik[] = [];
  const serializableStatistik: SerializableStatistik = {
    anzahlGeschaetzt: statistikenStore.summeAlleBucketsGeschaetzt(),
    anzahlUngeschaetzt: statistikenStore.summeAlleBucketsUngeschaetzt(),
    anzahlGesamt: statistikenStore.summeAlleBucketsGesamt(),
    min: statistikenStore.summeAlleBucketsMin(),
    max: statistikenStore.summeAlleBucketsMax(),
    anteilAnzahl: 1,
    durchschnitt: statistikenStore.summeAlleBucketsDurchschnitt(),
    median: statistikenStore.summeAlleBucketsMedian(),
    summeDurchschnitt: statistikenStore.summeAlleBucketsDurchschnittSumme(),
    summeMedian: statistikenStore.summeAlleBucketsMedianSumme(),
    summeSchaetzungen: statistikenStore.summeAlleBucketsSchaetzungenSumme()
  };
  arraySerializableStatistik.push(serializableStatistik);
  XLSX.utils.sheet_add_json(sheet, arraySerializableStatistik, { origin: "A2", skipHeader: true });
  XLSX.utils.sheet_add_json(sheet, [headersForStatistiken], { origin: "A1", skipHeader: true });
  sheet[XLSX.utils.encode_cell({ r: 1, c: 5 })].z = "0.00%";
  return arraySerializableStatistik.length;
}

function addEintraegeToSheet(sheet: WorkSheet, eintraege: AbstrakterEintrag[], startzeile: number) {
  interface SerializableEintrag {
    bezeichnung: string,
    aufschlag: number | null,
    aufwand: number,
    anteilZwischensumme: number | null,
    anteilGesamtprojekt: number | null
  }

  const headersForEintraege = [
    "Bezeichnung",
    "Aufschlag",
    "Aufwand",
    "Anteil an nächster Zwischensumme",
    "Anteil am Gesamtprojekt"
  ];
  const arraySerializableEintraege: SerializableEintrag[] = [];
  for (const eintrag of eintraege) {
    if (eintrag instanceof Eintrag) {
      const serializableEintrag: SerializableEintrag = {
        bezeichnung: eintrag.bezeichnung,
        aufschlag: eintrag.aufschlagWert/100,
        aufwand: eintrag.aufwandWert,
        anteilZwischensumme: eintrag.anteilZwischensumme/100,
        anteilGesamtprojekt: eintrag.anteilGesamtprojekt/100
      };
      arraySerializableEintraege.push(serializableEintrag);
    } else if (eintrag instanceof Zwischensumme) {
      if(eintrag.bezeichnung=="STARTSUMME"||eintrag.bezeichnung=="ENDSUMME") {
        const serializableEintrag: SerializableEintrag = {
          bezeichnung: eintrag.bezeichnung,
          aufschlag: null,
          aufwand: eintrag.zwischensummeAufwand,
          anteilZwischensumme: null,
          anteilGesamtprojekt: null
        };
        arraySerializableEintraege.push(serializableEintrag);
      }
      else {
        const serializableEintrag: SerializableEintrag = {
          bezeichnung: eintrag.bezeichnung,
          aufschlag: eintrag.vorigerAbschnittAufschlag / 100,
          aufwand: eintrag.zwischensummeAufwand,
          anteilZwischensumme: eintrag.anteilZwischensumme / 100,
          anteilGesamtprojekt: eintrag.anteilGesamtprojekt / 100
        };
        arraySerializableEintraege.push(serializableEintrag);
      }
    }
  }
  XLSX.utils.sheet_add_json(sheet, [headersForEintraege], { origin: { c: 0, r: startzeile }, skipHeader: true });
  XLSX.utils.sheet_add_json(sheet, arraySerializableEintraege, {
    origin: { c: 0, r: startzeile + 1 },
    skipHeader: true
  });
  sheet["D12"].s={
    font: {
      name: "Calibri",
      bold: true,
      color: { rgb: "FF0000" }
    },
    alignment: {
      wrapText:true
    }
  }
  for (let i = 0; i < arraySerializableEintraege.length; i++) {
    sheet[XLSX.utils.encode_cell({r:startzeile+i,c:1})].z="0.00%"
  }
}

function testfunction(pakete: Paket[]) {
  const wb = XLSX.utils.book_new();
  const ws  =XLSX.utils.json_to_sheet([]);
  const ws1 = XLSX.utils.json_to_sheet([{id:2,schaetzung:500},{id:3,schaetzung:300}]);
  const ws2  =XLSX.utils.json_to_sheet([{id:1,schaertzung:600}]);
  XLSX.utils.sheet_add_json(ws1,[{id:"abc"}],{origin:"A4",skipHeader:true})
  XLSX.utils.sheet_set_array_formula(ws1,"A4","MAX(IF(E3:E8<>0, E3:E8))")
  XLSX.utils.book_append_sheet(wb,ws,"Sheet")
  XLSX.utils.book_append_sheet(wb,ws1,"Sheet 1")
  XLSX.utils.book_append_sheet(wb,ws2,"Sheet 2")
  XLSX.writeFile(wb, "test.xlsx");
}

function styleFunction() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet([]);
  const array = [{ attr1: "attr1" }, { attr2: "attr2" }];
  XLSX.utils.sheet_add_json(ws, array, { skipHeader: true });
  ws["A1"].s = {
    font: {
      name: "Calibri",
      sz: 24,
      bold: true,
      color: { rgb: "FF0000" }
    },
    border: {
      top: { style: "thin", color: { rgb: "FF0000" } },
      bottom: { style: "thin", color: { rgb: "FF0000" } },
      left: { style: "thin", color: { rgb: "FF0000" } },
      right: { style: "thin", color: { rgb: "FF0000" } }
    }
  };
  XLSX.utils.book_append_sheet(wb, ws, "Test1");
  XLSX.writeFile(wb, "demo.xlsx");
}
</script>
