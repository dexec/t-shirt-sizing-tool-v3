import {defineStore} from "pinia";
import saveFile from "./file.json";
import {Eintrag} from "@/Eintrag";
import {Zwischensumme} from "@/Zwischensumme";
import type {AbstrakterEintrag} from "@/AbstrakterEintrag";
import {useStatistikenStore} from "@/stores/statistiken";
import {ref} from "vue";

export const useEintraegeStore = defineStore('eintrage', () => {
        const statistiken = useStatistikenStore();
        const eintraege = ref<Array<AbstrakterEintrag>>([]);
        eintraege.value.unshift(new Zwischensumme("STARTSUMME", 0, 0, 0, statistiken.summeAlleBucketsDurchschnitt()));
        let aktuelleZwischensumme = eintraege.value[0] as Zwischensumme;
        for (const eintrag of saveFile.eintraege) {
            if (eintrag.bezeichnung == "ZWISCHENSUMME") {
                const newZwischsumme = new Zwischensumme(eintrag.bezeichnung, 0, 0, 0, 0)
                aktuelleZwischensumme = newZwischsumme;
                eintraege.value.push(newZwischsumme);
            } else if (eintrag.aufschlagWert) eintraege.value.push(new Eintrag(eintrag.bezeichnung, 0, 0, eintrag.aufschlagWert, 0, true, aktuelleZwischensumme));
            else if (eintrag.aufwandWert) eintraege.value.push(new Eintrag(eintrag.bezeichnung, 0, 0, 0, eintrag.aufwandWert, false, aktuelleZwischensumme));
        }
        eintraege.value.push(new Zwischensumme("ENDSUMME", 0, 0, 0, 0))
        berechne();

        function berechne() {
            //Startsumme ist Ergebnis der Bucketübersicht
            const startsumme = eintraege.value[0] as Zwischensumme;
            startsumme.zwischensummeAufwand = statistiken.summeAlleBucketsDurchschnitt();
            const endsumme = eintraege.value[eintraege.value.length - 1] as Zwischensumme
            let zwischensumme = startsumme;
            let vorigerAbschnittAufschlag = 0;
            for (let i = eintraege.value.length - 2; i > 0; i--) {
                const eintrag = eintraege.value[i];
                if (eintrag instanceof Zwischensumme && eintrag.bezeichnung != "STARTSUMME" && eintrag.bezeichnung != "ENDSUMME") {
                    if (eintraege.value[i - 1] instanceof Zwischensumme) eintraege.value.splice(i, 1)
                }
            }
            if (startsumme.zwischensummeAufwand == 0) {
                for (const eintrag of eintraege.value) {
                    if (eintrag instanceof Eintrag) {
                        eintrag.isAufschlagBase ? eintrag.aufwandWert = 0 : eintrag.aufschlagWert = 0;
                        eintrag.referenzierteZwischensumme = zwischensumme;
                        eintrag.anteilZwischensumme = 0;
                        eintrag.anteilGesamtprojekt = 0;
                    } else if (eintrag instanceof Zwischensumme) {
                        eintrag.zwischensummeAufwand = 0;
                        eintrag.vorigerAbschnittAufschlag = 0;
                        eintrag.vorigerAbschnittAufwand = 0;
                        eintrag.anteilGesamtprojekt = 0;
                        eintrag.anteilZwischensumme = 0;
                        zwischensumme = eintrag;
                    }
                }
            } else {
                for (let i = 1; i < eintraege.value.length; i++) {
                    if (eintraege.value[i] instanceof Eintrag) {
                        const aktuellerEintrag = eintraege.value[i] as Eintrag
                        aktuellerEintrag.referenzierteZwischensumme = zwischensumme
                        aktuellerEintrag.isAufschlagBase ?
                            aktuellerEintrag.aufwandWert = aktuellerEintrag.aufschlagWert * aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand / 100 :
                            aktuellerEintrag.aufschlagWert = aktuellerEintrag.aufwandWert / aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand * 100
                        vorigerAbschnittAufschlag += aktuellerEintrag.aufschlagWert;
                    } else {

                        const aktuelleZwischensumme = eintraege.value[i] as Zwischensumme;
                        aktuelleZwischensumme.vorigerAbschnittAufschlag = vorigerAbschnittAufschlag;
                        aktuelleZwischensumme.vorigerAbschnittAufwand = vorigerAbschnittAufschlag * zwischensumme.zwischensummeAufwand / 100;
                        aktuelleZwischensumme.zwischensummeAufwand = zwischensumme.zwischensummeAufwand + aktuelleZwischensumme.vorigerAbschnittAufwand;
                        zwischensumme = aktuelleZwischensumme;
                        vorigerAbschnittAufschlag = 0;
                    }
                }
                for (let i = eintraege.value.length - 2; i >= 1; i--) {
                    if (eintraege.value[i] instanceof Eintrag) {
                        const aktuellerEintrag = eintraege.value[i] as Eintrag
                        aktuellerEintrag.anteilZwischensumme = Math.round((aktuellerEintrag.aufwandWert / zwischensumme.zwischensummeAufwand + Number.EPSILON) * 100);
                        aktuellerEintrag.anteilGesamtprojekt = Math.round((aktuellerEintrag.aufwandWert / endsumme.zwischensummeAufwand + Number.EPSILON) * 100);
                    } else {
                        const aktuelleZwischensumme = eintraege.value[i] as Zwischensumme
                        zwischensumme = aktuelleZwischensumme
                        aktuelleZwischensumme.anteilZwischensumme = Math.round((aktuelleZwischensumme.vorigerAbschnittAufwand / aktuelleZwischensumme.zwischensummeAufwand + Number.EPSILON) * 100);
                        aktuelleZwischensumme.anteilGesamtprojekt = Math.round((aktuelleZwischensumme.vorigerAbschnittAufwand / endsumme.zwischensummeAufwand + Number.EPSILON) * 100);
                    }
                }
            }
        }

        function updateBezeichnung(rowDataIndex: number, newBezeichnung: string) {
            const eintrag = eintraege.value[rowDataIndex] as Eintrag;
            if (eintrag) {
                eintrag.bezeichnung = newBezeichnung;
            }
        }

        function updateAufschlag(rowDataIndex: number, newAufschlag: number) {
            const eintrag = eintraege.value[rowDataIndex] as Eintrag;
            if (eintrag) {
                eintrag.aufschlagWert = newAufschlag;
                eintrag.aufwandWert = eintrag.aufschlagWert * eintrag.referenzierteZwischensumme.zwischensummeAufwand / 100;
                eintrag.isAufschlagBase = true;
                berechne()
            }
        }

        function updateAufwand(rowDataIndex: number, newAufschlag: number) {
            const eintrag = eintraege.value[rowDataIndex] as Eintrag;
            if (eintrag) {
                eintrag.aufwandWert = newAufschlag;
                eintrag.aufschlagWert = eintrag.aufwandWert / eintrag.referenzierteZwischensumme.zwischensummeAufwand * 100;
                eintrag.isAufschlagBase = false
                berechne()
            }
        }

        function addNewAufschlag(rowDataIndex: number) {
            const newAufschlag = new Eintrag("Neuer Aufschlag", 0, 0, 0, 0, false, aktuelleZwischensumme);
            if (rowDataIndex == -1) eintraege.value.splice(rowDataIndex, 0, newAufschlag);
            else eintraege.value.splice(rowDataIndex + 1, 0, newAufschlag);
            berechne();
        }

        function addNewZwischensumme(rowDataIndex: number) {
            const newAufschlag = new Zwischensumme("ZWISCHENSUMME", 0, 0, 0, 0)
            if (rowDataIndex == -1) eintraege.value.splice(eintraege.value.length - 1, 0, newAufschlag)
            else eintraege.value.splice(rowDataIndex + 1, 0, newAufschlag)
            berechne();
        }

        function deleteEintrag(rowDataIndex: number) {
            eintraege.value.splice(rowDataIndex, 1)
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
            updateBezeichnung,
            updateAufschlag,
            updateAufwand,
            addNewAufschlag,
            addNewZwischensumme,
            deleteEintrag,
            moveDown,
            moveUp
        }
    }
)