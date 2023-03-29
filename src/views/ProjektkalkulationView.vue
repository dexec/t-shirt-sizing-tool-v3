<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue style="width: 100%;height: 90%"
                 class="ag-theme-alpine"
                 :rowData="rowData"
                 :columnDefs="columnDefs"
                 rowSelection="single"
                 :rowClassRules="rowClassRules"
                 @cellValueChanged="onCellValueChanged"
                 @cellClicked='onCellClicked'
                 :navigateToNextCell='navigateToNextCell'
                 @grid-ready="onGridReady"
    ></ag-grid-vue>
    <!--    <v-data-table :headers="headers" :rowData="rowData" item-key="id" @click:row="selectRow"
                      single-select hide-default-footer fixed-header height="500"></v-data-table>
        -->
    <v-btn @click="zwischensummeErstellen">Zwischensumme erstellen</v-btn>
    <v-btn @click="zeileEntfernen">Zeile entfernen</v-btn>
    <v-btn @click="aufschlagErstellen">Aufschlag hinzufügen</v-btn>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";

import {useAufschlaegeStore} from '@/stores/aufschlag'

export default {
  name: "ProjektkalkulationView",
  components: {AgGridVue},
  data() {
    return {
      gridApi: null,
      columnApi: null,
      columnDefs: [
        {
          headerName: 'Bezeichnung',
          field: 'bezeichnung',
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME")
        },
        {
          headerName: 'Aufschlag',
          field: 'aufschlag',
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: params => params.value === null || params.value === 0 ? null : params.value + "%"
        },
        {headerName: 'Aufwand', field: 'aufwand'},
        {
          headerName: 'Anteil an nächster Zwischensumme',
          field: 'anteilZwischensumme',
          cellRenderer: params => params.value === null || params.value === 0 ? null : params.value + "%"
        },
        {
          headerName: 'Anteil am Gesamtprojekt',
          field: 'anteilGesamtprojekt',
          cellRenderer: params => params.value === null || params.value === 0 ? null : params.value + "%"
        },
      ],
    }
  },
  setup() {
    const aufschlaegeStore = useAufschlaegeStore()
    const rowData = [];
    aufschlaegeStore.getAufschlage.forEach(aufschlag => {
      rowData.push({
        bezeichnung: aufschlag.bezeichnung,
        aufschlag: aufschlag.aufschlag,
      })
    })
    return {aufschlaegeStore, rowData}
  },
  created() {
    this.rowClassRules = {
      'zwischensumme': (params) => {
        return params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"
      }
    }
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi;
      this.berechne();
    },
    onCellClicked(params) {
      this.selectedRow = params.data
    },
    onCellValueChanged(params) {
      this.aufschlaegeStore.updateAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]), params.data)
      this.rowData = this.aufschlaegeStore.getAufschlage
      this.gridApi.setRowData(this.aufschlaegeStore.getAufschlage)
      this.berechne()
    },
    berechne() {
      this.rowData[0].aufwand =  3272.75
      this.rowData[0].anteilZwischensumme=null
      this.rowData[0].anteilGesamtprojekt=null
      let startSumme = this.rowData[0].aufwand
      let zwischenSummeReferenz = startSumme;
      let zwischenSummeAufschlag = 0;
      let zwischenSummeAufwand = startSumme;
      let endSumme = startSumme;

      for (let i = 1; i < this.rowData.length; i++) {
        if (this.rowData[i].bezeichnung === "ZWISCHENSUMME") {
          this.rowData[i].aufschlag = zwischenSummeAufschlag;
          this.rowData[i].aufwand = zwischenSummeAufwand
          zwischenSummeReferenz = zwischenSummeAufwand
          zwischenSummeAufschlag = 0
        } else {
          this.rowData[i].aufwand = zwischenSummeReferenz * this.rowData[i].aufschlag / 100
          zwischenSummeAufschlag += this.rowData[i].aufschlag
          zwischenSummeAufwand += this.rowData[i].aufwand
          endSumme += this.rowData[i].aufwand
        }
      }
      for (let i = this.rowData.length - 2; i >= 1; i--) {
        if (this.rowData[i].bezeichnung === "ZWISCHENSUMME") {
          zwischenSummeAufwand = this.rowData[i].aufwand
          this.rowData[i].anteilZwischensumme = null
          this.rowData[i].anteilGesamtprojekt = null
        } else {
          this.rowData[i].anteilZwischensumme = Math.round(this.rowData[i].aufwand / zwischenSummeAufwand * 100)
          this.rowData[i].anteilGesamtprojekt = Math.round(this.rowData[i].aufwand / endSumme * 100)
        }
      }
      this.rowData[this.rowData.length - 1].aufwand = endSumme
      this.rowData[this.rowData.length - 1].anteilZwischensumme = null
      this.rowData[this.rowData.length - 1].anteilGesamtprojekt = null
      this.gridApi.refreshCells({force: true})
    },
    aufschlagErstellen() {
      if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return
      this.aufschlaegeStore.addNewAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]), "beispiel", 0)
      this.rowData = this.aufschlaegeStore.getAufschlage
      this.gridApi.setRowData(this.aufschlaegeStore.getAufschlage)
      this.berechne()
    },
    zwischensummeErstellen() {
      if (this.gridApi.getSelectedRows()[0].bezeichnung === "ZWISCHENSUMME") return
      if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return
      if (this.gridApi.getSelectedRows()[0].bezeichnung === "STARTSUMME") return
      if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "ZWISCHENSUMME") return
      if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "ENDSUMME") return
      if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "STARTSUMME") return
      this.aufschlaegeStore.addNewZwischensumme(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]))
      this.rowData = this.aufschlaegeStore.getAufschlage
      this.gridApi.setRowData(this.aufschlaegeStore.getAufschlage)
      this.berechne()
    },
    zeileEntfernen() {
      if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return
      this.aufschlaegeStore.deleteAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]))
      this.rowData = this.aufschlaegeStore.getAufschlage
      this.gridApi.setRowData(this.aufschlaegeStore.getAufschlage)
      this.berechne()
    },
    navigateToNextCell(params) {
      const suggestedNextCell = params.nextCellPosition
      const KEY_UP = 'ArrowUp'
      const KEY_DOWN = 'ArrowDown'
      const noUpOrDownKeyPressed =
          params.key !== KEY_DOWN && params.key !== KEY_UP
      if (noUpOrDownKeyPressed || !suggestedNextCell) {
        return suggestedNextCell
      }
      params.api.forEachNode(function (node) {
        if (node.rowIndex === suggestedNextCell.rowIndex) {
          node.setSelected(true)
        }
      })
      return suggestedNextCell
    }
  }
}
</script>

<style>
.zwischensumme {
  font-weight: bold !important;
}
</style>
