import {defineStore} from 'pinia'
import saveFile from './file.json'
import {Aufschlag} from "@/Aufschag";

const aufschlaege: Aufschlag[] = saveFile.aufschlaege;
aufschlaege.unshift(new Aufschlag("STARTSUMME",0))
aufschlaege.push(new Aufschlag("ENDSUMME", 0))
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
        updateAufschlag(rowDataIndex:number, newAufschlag: Aufschlag) {
            const oldAufschlag = aufschlaege[rowDataIndex];
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
        }
    }
})