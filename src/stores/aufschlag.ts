import {defineStore} from 'pinia'
import saveFile from './file.json'
import {Aufschlag} from "@/Aufschag";
import { Zwischensumme } from "@/Zwischensumme";
import type { AbstrakterAufschlag } from "@/AbstrakterAufschlag";

const aufschlaege: AbstrakterAufschlag[] = [];
for(const aufschlag of saveFile.aufschlaege) {
  if(aufschlag.bezeichnung=="ZWISCHENSUMME" || aufschlag.bezeichnung=="ENDSUMME") {
    aufschlaege.push(new Zwischensumme(aufschlag.bezeichnung, 0,0,0,0,0));
  }
  else aufschlaege.push(new Aufschlag(aufschlag.bezeichnung,0,0,aufschlag.aufschlag,0));
}
aufschlaege.unshift(new Zwischensumme("STARTSUMME",0,0,0,0,100))
aufschlaege.push(new Zwischensumme("ENDSUMME", 0,0,0,0,100))
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
        const startsumme = this.aufschlaege[0] as Zwischensumme;
        const endsumme = this.aufschlaege[this.aufschlaege.length-1] as Zwischensumme
        let zwischensummeReferenz = startsumme.zwischensummeAufwand;
        let vorigerAbschnittAufschlag = 0;
        let vorigerAbschnittAufwand = 0;
        endsumme.zwischensummeAufwand = startsumme.zwischensummeAufwand;

        for (let i = 1; i < this.aufschlaege.length; i++) {
          if (this.aufschlaege[i].bezeichnung === "ZWISCHENSUMME") {
            const zwischensumme = this.aufschlaege[i] as Zwischensumme;
            zwischensumme.vorigerAbschnittAufschlag = vorigerAbschnittAufschlag;
            zwischensumme.vorigerAbschnittAufwand = vorigerAbschnittAufwand;
            zwischensumme.zwischensummeAufwand = zwischensummeReferenz + vorigerAbschnittAufwand;
            zwischensummeReferenz += vorigerAbschnittAufwand;
            vorigerAbschnittAufschlag = 0;
            vorigerAbschnittAufwand = 0;
          } else {
            const aktuellerAufschlag = this.aufschlaege[i] as Aufschlag
            aktuellerAufschlag.aufwand = zwischensummeReferenz * aktuellerAufschlag.aufschlag / 100;
            vorigerAbschnittAufschlag += aktuellerAufschlag.aufschlag;
            vorigerAbschnittAufwand += aktuellerAufschlag.aufwand;
            endsumme.zwischensummeAufwand += aktuellerAufschlag.aufwand;
          }
        }
        for (let i = this.aufschlaege.length - 2; i >= 1; i--) {
          if (this.aufschlaege[i].bezeichnung === "ZWISCHENSUMME") {
            const zwischensumme = this.aufschlaege[i] as Zwischensumme
            vorigerAbschnittAufwand = zwischensumme.vorigerAbschnittAufwand;
            zwischensumme.anteilZwischensumme = Math.round((zwischensumme.vorigerAbschnittAufwand / zwischensumme.zwischensummeAufwand + Number.EPSILON) * 100);
            zwischensumme.anteilGesamtprojekt = Math.round((zwischensumme.vorigerAbschnittAufwand / endsumme.zwischensummeAufwand + Number.EPSILON) * 100);
          } else {
            const aktuellerAufschlag = this.aufschlaege[i] as Aufschlag
            aktuellerAufschlag.anteilZwischensumme = Math.round((aktuellerAufschlag.aufwand / vorigerAbschnittAufwand + Number.EPSILON) * 100);
            aktuellerAufschlag.anteilGesamtprojekt = Math.round((aktuellerAufschlag.aufwand / endsumme.zwischensummeAufwand + Number.EPSILON) * 100);
          }
        }
        endsumme.anteilZwischensumme = 0;
        endsumme.anteilGesamtprojekt = 0;
      },
        updateAufschlag(rowDataIndex:number, newAufschlag: Aufschlag) {
            const oldAufschlag = aufschlaege[rowDataIndex] as Aufschlag;
            if (typeof oldAufschlag != 'undefined') {
                oldAufschlag.bezeichnung=newAufschlag.bezeichnung;
                oldAufschlag.aufschlag=parseInt(String(newAufschlag.aufschlag));
            }
        },
        updateAllAufschlage(newAufschlaege: Aufschlag[]) {
            this.aufschlaege = newAufschlaege;
        },
        addNewAufschlag(rowDataIndex: number, bezeichnung: string, aufschlag: number) {
            const newAufschlag = new Aufschlag(bezeichnung, aufschlag);
            if (rowDataIndex == -1) aufschlaege.splice(rowDataIndex, 0, newAufschlag)
            else aufschlaege.splice(rowDataIndex+1, 0, newAufschlag)
        },
        addNewZwischensumme(rowDataIndex: number) {
            const newAufschlag = new Aufschlag("ZWISCHENSUMME", 0)
            if (rowDataIndex == -1) aufschlaege.splice(aufschlaege.length - 1, 0, newAufschlag)
            else aufschlaege.splice(rowDataIndex + 1, 0, newAufschlag)
        },
        deleteAufschlag(rowDataIndex: number) {
            this.aufschlaege.splice(rowDataIndex, 1)
        },
      moveDown: function(rowDataIndex: number) {
        if (this.aufschlaege[rowDataIndex + 1].bezeichnung == "ENDSUMME") return;
        if (this.aufschlaege[rowDataIndex + 1].bezeichnung == "ZWISCHENSUMME") {
          return;
        }
      }
    }
})