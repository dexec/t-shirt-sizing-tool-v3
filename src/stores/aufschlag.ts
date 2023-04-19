import {defineStore} from "pinia";
import saveFile from "./file.json";
import {Aufschlag} from "@/Aufschag";
import {Zwischensumme} from "@/Zwischensumme";
import type {AbstrakterAufschlag} from "@/AbstrakterAufschlag";

const aufschlaege: AbstrakterAufschlag[] = [];
aufschlaege.unshift(new Zwischensumme("STARTSUMME", 0, 0, 0, 3272.75));
let aktuelleZwischensumme = aufschlaege[0] as Zwischensumme;
for (const aufschlag of saveFile.aufschlaege) {
    if (aufschlag.bezeichnung == "ZWISCHENSUMME") {
        const newZwischsumme = new Zwischensumme(aufschlag.bezeichnung, 0, 0, 0, 0)
        aktuelleZwischensumme = newZwischsumme;
        aufschlaege.push(newZwischsumme);
    } else if(aufschlag.aufschlagWert) aufschlaege.push(new Aufschlag(aufschlag.bezeichnung, 0, 0, aufschlag.aufschlagWert, null, aktuelleZwischensumme));
    else if(aufschlag.aufwandWert) aufschlaege.push(new Aufschlag(aufschlag.bezeichnung, 0, 0, null, aufschlag.aufwandWert, aktuelleZwischensumme));
}
aufschlaege.push(new Zwischensumme("ENDSUMME", 0, 0, 0, 100))
export const useAufschlaegeStore = defineStore('aufschlaege', {
    state: () => ({
        aufschlaege: aufschlaege
    }),
    getters: {
        getAufschlage(state) {
            return state.aufschlaege
        }
    },
    actions: {
        berechne() {
            //Startsumme ist Ergebnis der Projektkalkulation
            const startsumme = this.aufschlaege[0] as Zwischensumme;
            const endsumme = this.aufschlaege[this.aufschlaege.length - 1] as Zwischensumme
            let zwischensumme = startsumme;
            let vorigerAbschnittAufschlag = 0;
            for (let i = 1; i < this.aufschlaege.length; i++) {
                if (this.aufschlaege[i] instanceof Aufschlag) {
                    const aktuellerAufschlag = this.aufschlaege[i] as Aufschlag
                    aktuellerAufschlag.referenzierteZwischensumme = zwischensumme
                    vorigerAbschnittAufschlag += aktuellerAufschlag.berechneAufschlag();
                } else {
                    const aktuelleZwischensumme = this.aufschlaege[i] as Zwischensumme;
                    aktuelleZwischensumme.vorigerAbschnittAufschlag = vorigerAbschnittAufschlag;
                    aktuelleZwischensumme.vorigerAbschnittAufwand = vorigerAbschnittAufschlag * zwischensumme.zwischensummeAufwand / 100;
                    aktuelleZwischensumme.zwischensummeAufwand = zwischensumme.zwischensummeAufwand + aktuelleZwischensumme.vorigerAbschnittAufwand;
                    zwischensumme = aktuelleZwischensumme;
                    vorigerAbschnittAufschlag = 0;
                }
            }
            for (let i = this.aufschlaege.length - 2; i >= 1; i--) {
                if (this.aufschlaege[i] instanceof Aufschlag) {
                    const aktuellerAufschlag = this.aufschlaege[i] as Aufschlag
                    aktuellerAufschlag.anteilZwischensumme = Math.round((aktuellerAufschlag.berechneAufwand() / zwischensumme.zwischensummeAufwand + Number.EPSILON) * 100);
                    aktuellerAufschlag.anteilGesamtprojekt = Math.round((aktuellerAufschlag.berechneAufwand() / endsumme.zwischensummeAufwand + Number.EPSILON) * 100);
                } else {
                    const aktuelleZwischensumme = this.aufschlaege[i] as Zwischensumme
                    zwischensumme = aktuelleZwischensumme
                    aktuelleZwischensumme.anteilZwischensumme = Math.round((aktuelleZwischensumme.vorigerAbschnittAufwand / aktuelleZwischensumme.zwischensummeAufwand + Number.EPSILON) * 100);
                    aktuelleZwischensumme.anteilGesamtprojekt = Math.round((aktuelleZwischensumme.vorigerAbschnittAufwand / endsumme.zwischensummeAufwand + Number.EPSILON) * 100);

                }
            }
        },
        updateBezeichnung(rowDataIndex: number, newBezeichnung: string) {
            const aufschlag = aufschlaege[rowDataIndex] as Aufschlag;
            if (typeof aufschlag != 'undefined') {
                aufschlag.bezeichnung = newBezeichnung;
            }
        },
        updateAufschlag(rowDataIndex: number, newAufschlag: number) {
            const aufschlag = aufschlaege[rowDataIndex] as Aufschlag;
            if (typeof aufschlag != 'undefined') {
                if (aufschlag.aufwandWert) {
                    aufschlag.aufwandWert = null;
                }
                aufschlag.aufschlagWert = newAufschlag;
                this.berechne()
            }
        },
        updateAufwand(rowDataIndex: number, newAufschlag: number) {
            const aufschlag = aufschlaege[rowDataIndex] as Aufschlag;
            if (typeof aufschlag != 'undefined') {
                if (aufschlag.aufschlagWert) {
                    aufschlag.aufschlagWert = null;
                }
                aufschlag.aufwandWert = newAufschlag;
                this.berechne()
            }
        },
        updateAllAufschlage(newAufschlaege: Aufschlag[]) {
            this.aufschlaege = newAufschlaege;
        },
        addNewAufschlag(rowDataIndex: number) {
            const newAufschlag = new Aufschlag("Neuer Aufschlag", 0, 0, null, null, aktuelleZwischensumme);
            if (rowDataIndex == -1) aufschlaege.splice(rowDataIndex, 0, newAufschlag);
            else aufschlaege.splice(rowDataIndex + 1, 0, newAufschlag);
            this.berechne();
        },
        addNewZwischensumme(rowDataIndex: number) {
            const newAufschlag = new Zwischensumme("ZWISCHENSUMME", 0, 0, 0, 0)
            if (rowDataIndex == -1) aufschlaege.splice(aufschlaege.length - 1, 0, newAufschlag)
            else aufschlaege.splice(rowDataIndex + 1, 0, newAufschlag)
            this.berechne();
        },
        deleteAufschlag(rowDataIndex: number) {
            this.aufschlaege.splice(rowDataIndex, 1)
            this.berechne();
        },
        moveDown: function (rowDataIndex: number) {
            if (this.aufschlaege[rowDataIndex + 1].bezeichnung == "ENDSUMME") return;
            if (this.aufschlaege[rowDataIndex + 1].bezeichnung == "ZWISCHENSUMME") {
                return;
            }
        }
    }
})