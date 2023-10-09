import { defineStore } from "pinia";
import { Eintrag } from "@/models/Eintrag";
import { Zwischensumme } from "@/models/Zwischensumme";
import type { AbstrakterEintrag } from "@/models/AbstrakterEintrag";
import { useStatistikenStore } from "@/stores/statistiken";
import { ref } from "vue";
import {useProjektStore} from "@/stores/projekt";

export const useEintraegeStore = defineStore("eintraege", () => {
    const eintraege = ref<Array<AbstrakterEintrag>>([]);
    if (eintraege.value.length > 0) berechne();

    function berechne() {
      const statistikenStore = useStatistikenStore();
      const projectStore = useProjektStore();
      //Startsumme ist Ergebnis der Bucketübersicht
      const startsumme = eintraege.value[0] as Zwischensumme;
      const bucketsDurchschnittSumme = statistikenStore.summeAlleBucketsDurchschnittSumme();
      if(bucketsDurchschnittSumme != null) startsumme.zwischensummeAufwand =  bucketsDurchschnittSumme
      else startsumme.zwischensummeAufwand = 0
      const endsumme = eintraege.value[eintraege.value.length - 1] as Zwischensumme;
      let zwischensumme = startsumme;
      let vorigerAbschnittAufwand = 0;
      let vorigerAbschnittAufschlag = 0
      for (let i = eintraege.value.length - 2; i > 0; i--) {
        const eintrag = eintraege.value[i];
        if (eintrag instanceof Zwischensumme && eintrag.bezeichnung != "STARTSUMME" && eintrag.bezeichnung != "ENDSUMME") {
          if (eintraege.value[i - 1] instanceof Zwischensumme) eintraege.value.splice(i, 1);
        }
      }
      for (let i = 1; i < eintraege.value.length; i++) {
        if (eintraege.value[i] instanceof Eintrag) {
          const aktuellerEintrag = eintraege.value[i] as Eintrag;
          aktuellerEintrag.referenzierteZwischensumme = zwischensumme;
          if (aktuellerEintrag.isAufwandRelativBase) {
            aktuellerEintrag.aufwandAbsolut = aktuellerEintrag.aufwandRelativ * aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand / 100
            //aktuellerEintrag.aufwandAbsolut = parseFloat((aktuellerEintrag.aufwandRelativ * aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand / 100).toFixed(projectStore.nachkommastellen));
          } else {
            if (aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand == 0) aktuellerEintrag.aufwandRelativ = parseFloat(Number(0).toFixed(projectStore.nachkommastellen));
            else {
              //aktuellerEintrag.aufwandRelativ = parseFloat((aktuellerEintrag.aufwandAbsolut / aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand * 100).toFixed(projectStore.nachkommastellen));
              aktuellerEintrag.aufwandRelativ = aktuellerEintrag.aufwandAbsolut / aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand * 100
            }
          }
          vorigerAbschnittAufwand += aktuellerEintrag.aufwandAbsolut;
          vorigerAbschnittAufschlag += aktuellerEintrag.aufwandRelativ;
        } else {
          const aktuelleZwischensumme = eintraege.value[i] as Zwischensumme;
          aktuelleZwischensumme.vorigerAbschnittAufwand = vorigerAbschnittAufwand
          aktuelleZwischensumme.vorigerAbschnittAufschlag =vorigerAbschnittAufschlag
          aktuelleZwischensumme.zwischensummeAufwand = zwischensumme.zwischensummeAufwand + aktuelleZwischensumme.vorigerAbschnittAufwand;
          zwischensumme = aktuelleZwischensumme;
          vorigerAbschnittAufwand = 0;
          vorigerAbschnittAufschlag = 0;
        }
      }
      for (let i = eintraege.value.length - 2; i >= 1; i--) {
        if (eintraege.value[i] instanceof Eintrag) {
          const aktuellerEintrag = eintraege.value[i] as Eintrag;
          if (zwischensumme.zwischensummeAufwand == 0) aktuellerEintrag.anteilZwischensumme = 0;
          else aktuellerEintrag.anteilZwischensumme = parseFloat((aktuellerEintrag.aufwandAbsolut / zwischensumme.zwischensummeAufwand * 100).toFixed(projectStore.nachkommastellen));
          if (endsumme.zwischensummeAufwand == 0) aktuellerEintrag.anteilGesamtprojekt = 0;
          else aktuellerEintrag.anteilGesamtprojekt = parseFloat((aktuellerEintrag.aufwandAbsolut / endsumme.zwischensummeAufwand  * 100).toFixed(projectStore.nachkommastellen));
        } else {
          const aktuelleZwischensumme = eintraege.value[i] as Zwischensumme;
          zwischensumme = aktuelleZwischensumme;
          if (aktuelleZwischensumme.zwischensummeAufwand == 0) aktuelleZwischensumme.anteilZwischensumme = 0;
          else aktuelleZwischensumme.anteilZwischensumme = parseFloat((aktuelleZwischensumme.vorigerAbschnittAufwand / aktuelleZwischensumme.zwischensummeAufwand * 100).toFixed(projectStore.nachkommastellen));
          if (endsumme.zwischensummeAufwand == 0) aktuelleZwischensumme.anteilGesamtprojekt = 0;
          else aktuelleZwischensumme.anteilGesamtprojekt = parseFloat((aktuelleZwischensumme.vorigerAbschnittAufwand / endsumme.zwischensummeAufwand * 100).toFixed(projectStore.nachkommastellen));
        }
      }
    }

    function updateAufschlag(rowDataIndex: number, newAufschlag: number) {
      const projectStore = useProjektStore();
      const eintrag = eintraege.value[rowDataIndex] as Eintrag;
      if (eintrag) {
        eintrag.aufwandRelativ = newAufschlag;
        eintrag.aufwandAbsolut = parseFloat((eintrag.aufwandRelativ * eintrag.referenzierteZwischensumme.zwischensummeAufwand / 100).toFixed(projectStore.nachkommastellen));
        eintrag.isAufwandRelativBase = true;
        berechne();
      }
    }

    function updateAufwand(rowDataIndex: number, newAufwand: number) {
      const projectStore = useProjektStore();
      const eintrag = eintraege.value[rowDataIndex] as Eintrag;
      if (eintrag) {
        eintrag.aufwandAbsolut = newAufwand;
        eintrag.aufwandRelativ = parseFloat((eintrag.aufwandAbsolut / eintrag.referenzierteZwischensumme.zwischensummeAufwand * 100).toFixed(projectStore.nachkommastellen));
        eintrag.isAufwandRelativBase = false;
        berechne();
      }
    }

    function addNewAufschlag(rowDataIndex: number) {
      let aktuelleZwischensumme: Zwischensumme | undefined = undefined;
      for (let i = rowDataIndex; i >= 0; i--) {
        if (eintraege.value[i] instanceof Zwischensumme) {
          aktuelleZwischensumme = eintraege.value[i] as Zwischensumme;
          break;
        }
      }
      const newAufschlag = new Eintrag("Neuer Aufschlag", 0, 0, 0, 0, false, aktuelleZwischensumme!);
      if (rowDataIndex == -1) eintraege.value.splice(rowDataIndex, 0, newAufschlag);
      else eintraege.value.splice(rowDataIndex + 1, 0, newAufschlag);
      berechne();
    }

    function addNewZwischensumme(rowDataIndex: number) {
      const newAufschlag = new Zwischensumme("ZWISCHENSUMME", 0, 0, 0, 0);
      if (rowDataIndex == -1) eintraege.value.splice(eintraege.value.length - 1, 0, newAufschlag);
      else eintraege.value.splice(rowDataIndex + 1, 0, newAufschlag);
      berechne();
    }

    function deleteEintrag(rowDataIndex: number) {
      eintraege.value.splice(rowDataIndex, 1);
      if (eintraege.value[rowDataIndex] instanceof Zwischensumme &&
        eintraege.value[rowDataIndex].bezeichnung != "ENDSUMME" &&
        eintraege.value[rowDataIndex].bezeichnung != "STARTSUMME" &&
        eintraege.value[rowDataIndex - 1] instanceof Zwischensumme
      )
        deleteEintrag(rowDataIndex);
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
      updateAufschlag,
      updateAufwand,
      addNewAufschlag,
      addNewZwischensumme,
      deleteEintrag,
      moveDown,
      moveUp
    };
  }
);