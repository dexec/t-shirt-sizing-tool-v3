import { defineStore } from "pinia";
import { Zwischensumme } from "@/models/Zwischensumme";
import type { AbstrakterEintrag } from "@/models/AbstrakterEintrag";
import { useStatistikenStore } from "@/stores/statistikenService";
import { ref } from "vue";
import { useKonfigContainer } from "@/stores/konfigContainer";
import { Aufschlag } from "@/models/Aufschlag";
import {SummeET} from "@/enums/SummeET";

export const useEintragContainer = defineStore("eintraege", () => {
      const eintraege = ref<Array<AbstrakterEintrag>>([]);
      const konfigContainer = useKonfigContainer();
      if (eintraege.value.length > 0) berechne();


      function berechne() {
        const statistikenStore = useStatistikenStore();
        //Startsumme ist Ergebnis der Bucketübersicht
        const startsumme = eintraege.value[0] as Zwischensumme;
        if (konfigContainer.bucketmodus) {
          const bucketsDurchschnittSumme = statistikenStore.summeAlleBucketsDurchschnittSumme();
          if (bucketsDurchschnittSumme != null) startsumme.zwischensummeAufwand = bucketsDurchschnittSumme;
          else startsumme.zwischensummeAufwand = 0;
        } else {
          const summeSchaetzungen = statistikenStore.summeAlleBucketsSchaetzungenSumme();
          if (summeSchaetzungen != null) startsumme.zwischensummeAufwand = summeSchaetzungen;
          else startsumme.zwischensummeAufwand = 0;
        }
        setzeEintraegeBeziehungen();
        updateAufwaendeUndBerechneZwischensummenAufwaende();
        berechneAnteile();
        doppelteZwischensummenEntfernen();
      }

      function updateAufwaendeUndBerechneZwischensummenAufwaende() {
        let vorigerAbschnittAufwandAbsolut = 0;
        let vorigerAbschnittAufwandRelativ = 0;
        let aktuelleZwischensumme = eintraege.value[0] as Zwischensumme;
        for (let i = 1; i < eintraege.value.length; i++) {
          const aktuellerEintrag = eintraege.value[i];
          if (aktuellerEintrag instanceof Aufschlag) {
            if (aktuellerEintrag.isAufwandRelativBase) {
              aktuellerEintrag.aufwandAbsolut = aktuellerEintrag.aufwandRelativ * aktuellerEintrag.basisZwischensumme.zwischensummeAufwand / 100;
            } else {
              if(aktuellerEintrag.basisZwischensumme.zwischensummeAufwand == 0) aktuellerEintrag.aufwandRelativ = 0
              else aktuellerEintrag.aufwandRelativ = aktuellerEintrag.aufwandAbsolut / aktuellerEintrag.basisZwischensumme.zwischensummeAufwand * 100;
            }
            vorigerAbschnittAufwandAbsolut += aktuellerEintrag.aufwandAbsolut;
            vorigerAbschnittAufwandRelativ += aktuellerEintrag.aufwandRelativ;
          } else if (aktuellerEintrag instanceof Zwischensumme) {
            aktuellerEintrag.vorigerAbschnittAufwandAbsolut = vorigerAbschnittAufwandAbsolut;
            aktuellerEintrag.vorigerAbschnittAufwandRelativ = vorigerAbschnittAufwandRelativ;
            aktuellerEintrag.zwischensummeAufwand = aktuelleZwischensumme.zwischensummeAufwand + vorigerAbschnittAufwandAbsolut;
            aktuelleZwischensumme = aktuellerEintrag;
            vorigerAbschnittAufwandAbsolut = 0;
            vorigerAbschnittAufwandRelativ = 0;
          }
        }
      }

      function setzeEintraegeBeziehungen() {
        let aktuelleZwischensumme = eintraege.value[0] as Zwischensumme;
        for (let i = 1; i < eintraege.value.length; i++) {
          const aktuellerEintrag = eintraege.value[i];
          if (aktuellerEintrag instanceof Aufschlag) {
            aktuellerEintrag.basisZwischensumme = aktuelleZwischensumme;
          } else if (aktuellerEintrag instanceof Zwischensumme) {
            aktuelleZwischensumme = aktuellerEintrag;
          }
        }
        let naechsteZwischensumme = eintraege.value[eintraege.value.length - 1] as Zwischensumme;
        for (let i = eintraege.value.length - 2; i >= 1; i--) {
          const aktuellerEintrag = eintraege.value[i];
          if (aktuellerEintrag instanceof Aufschlag) {
            aktuellerEintrag.naechsteZwischensumme = naechsteZwischensumme;
          } else if (aktuellerEintrag instanceof Zwischensumme) {
            naechsteZwischensumme = aktuellerEintrag;
          }
        }
      }

      function berechneAnteile() {
        const endsumme = eintraege.value[eintraege.value.length - 1] as Zwischensumme;
        for (let i = 1; i < eintraege.value.length; i++) {
          const aktuellerEintrag = eintraege.value[i];
          if (aktuellerEintrag instanceof Aufschlag) {
            const naechsteZwischensumme = aktuellerEintrag.naechsteZwischensumme;
            if (naechsteZwischensumme.zwischensummeAufwand == 0) aktuellerEintrag.anteilZwischensumme = 0;
            else aktuellerEintrag.anteilZwischensumme = parseFloat((aktuellerEintrag.aufwandAbsolut / naechsteZwischensumme.zwischensummeAufwand * 100).toFixed(konfigContainer.nachkommastellen));
            if (endsumme.zwischensummeAufwand == 0) aktuellerEintrag.anteilGesamtprojekt = 0;
            else aktuellerEintrag.anteilGesamtprojekt = parseFloat((aktuellerEintrag.aufwandAbsolut / endsumme.zwischensummeAufwand * 100).toFixed(konfigContainer.nachkommastellen));
          } else if (aktuellerEintrag instanceof Zwischensumme) {
            if (aktuellerEintrag.zwischensummeAufwand == 0) aktuellerEintrag.anteilZwischensumme = 0;
            else aktuellerEintrag.anteilZwischensumme = parseFloat((aktuellerEintrag.vorigerAbschnittAufwandAbsolut / aktuellerEintrag.zwischensummeAufwand * 100).toFixed(konfigContainer.nachkommastellen));
            if (endsumme.zwischensummeAufwand == 0) aktuellerEintrag.anteilGesamtprojekt = 0;
            else aktuellerEintrag.anteilGesamtprojekt = parseFloat((aktuellerEintrag.vorigerAbschnittAufwandAbsolut / endsumme.zwischensummeAufwand * 100).toFixed(konfigContainer.nachkommastellen));
          }
        }
      }

      function doppelteZwischensummenEntfernen() {
        for (let i = eintraege.value.length - 2; i > 0; i--) {
          const eintrag = eintraege.value[i];
          if (eintrag instanceof Zwischensumme && eintrag.bezeichnung != "Startsumme" && eintrag.bezeichnung != "Endsumme") {
            if (eintraege.value[i - 1] instanceof Zwischensumme) eintraege.value.splice(i, 1);
          }
        }
      }

      function updateAufwandRelativ(rowDataIndex: number, newAufwandRelativ: number) {
        const eintrag = eintraege.value[rowDataIndex] as Aufschlag;
        if (eintrag) {
          eintrag.aufwandRelativ = newAufwandRelativ;
          eintrag.aufwandAbsolut = parseFloat((eintrag.aufwandRelativ * eintrag.basisZwischensumme.zwischensummeAufwand / 100).toFixed(konfigContainer.nachkommastellen));
          eintrag.isAufwandRelativBase = true;
          berechne();
        }
      }

      function updateAufwandAbsolut(rowDataIndex: number, newAufwandAbsolut: number) {
        const eintrag = eintraege.value[rowDataIndex] as Aufschlag;
        if (eintrag) {
          eintrag.aufwandAbsolut = newAufwandAbsolut;
          eintrag.aufwandRelativ = parseFloat((eintrag.aufwandAbsolut / eintrag.basisZwischensumme.zwischensummeAufwand * 100).toFixed(konfigContainer.nachkommastellen));
          eintrag.isAufwandRelativBase = false;
          berechne();
        }
      }

      function addNewEintrag(rowDataIndex: number) {
        const newAufschlag = new Aufschlag("Neuer Aufschlag", 0, 0, 0, 0, false, null, null);
        if (rowDataIndex == -1) eintraege.value.splice(rowDataIndex, 0, newAufschlag);
        else eintraege.value.splice(rowDataIndex + 1, 0, newAufschlag);
        berechne();
      }

      function addNewZwischensumme(rowDataIndex: number) {
        const newAufschlag = new Zwischensumme("Zwischensumme", 0, 0, 0, 0);
        if (rowDataIndex == -1) eintraege.value.splice(eintraege.value.length - 1, 0, newAufschlag);
        else eintraege.value.splice(rowDataIndex + 1, 0, newAufschlag);
        berechne();
      }

      function deleteEintrag(rowDataIndex: number) {
        eintraege.value.splice(rowDataIndex, 1);
        if (eintraege.value[rowDataIndex] instanceof Zwischensumme &&
            eintraege.value[rowDataIndex].bezeichnung != SummeET.STARTSUMME &&
            eintraege.value[rowDataIndex].bezeichnung != SummeET.ENDSUMME &&
            eintraege.value[rowDataIndex - 1] instanceof Zwischensumme
        ) {
          deleteEintrag(rowDataIndex);
        }
        berechne();
      }

      function moveDown(rowDataIndex: number) {
        if (rowDataIndex > 0 && rowDataIndex < eintraege.value.length - 2) {
          const eintrag = eintraege.value[rowDataIndex];
          eintraege.value[rowDataIndex] = eintraege.value[rowDataIndex + 1];
          eintraege.value[rowDataIndex + 1] = eintrag;
          berechne();
        }
      }

      function moveUp(rowDataIndex: number) {
        if (rowDataIndex > 1 && rowDataIndex < eintraege.value.length - 1) {
          const eintrag = eintraege.value[rowDataIndex];
          eintraege.value[rowDataIndex] = eintraege.value[rowDataIndex - 1];
          eintraege.value[rowDataIndex - 1] = eintrag;
          berechne();
        }
      }

      return {
        eintraege,
        berechne,
        updateAufwandRelativ,
        updateAufwandAbsolut,
        addNewEintrag,
        addNewZwischensumme,
        deleteEintrag,
        moveDown,
        moveUp
      };
    }
  )
;