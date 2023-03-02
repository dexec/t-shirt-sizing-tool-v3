<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue style="width: 100%;height: 90%"
                 class="ag-theme-alpine"
                 :rowData="rowData"
                 :columnDefs="columnDefs"
                 rowSelection="single"
                 animateRows="true"
                 @grid-ready="onGridReady"
    ></ag-grid-vue>
<!--    <v-data-table :headers="headers" :rowData="rowData" item-key="id" @click:row="selectRow"
                  single-select hide-default-footer fixed-header height="500"></v-data-table>
    --><v-btn @click="zwischensummeErstellen">Zwischensumme erstellen</v-btn>
    <v-btn>Zeile entfernen</v-btn>
    <v-dialog max-width="10%" v-model="dialog_createAufschlag">
      <template v-slot:activator="{on}">
        <v-btn v-on="on">Aufschlag hinzufügen</v-btn>
      </template>
      <v-card>
        <v-form>
          <v-container>
            <v-card-text>
              <v-row justify="center">
                <v-text-field v-model="aufschlag_bezeichnung" label="Bezeichnung" clearable></v-text-field>
              </v-row>
              <v-row justify="center">
                <v-text-field type="number" v-model="aufschlag_wert" label="Aufschlag" clearable></v-text-field>
              </v-row>
            </v-card-text>
            <v-card-actions>
              <v-row justify="center">
                <v-btn @click="aufschlagErstellen">Anlegen</v-btn>
              </v-row>
            </v-card-actions>
          </v-container>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";

export default {
  name: "ProjektkalkulationView",
  components: {AgGridVue},
  data() {
    return {
      gridApi: null,
      columnApi: null,
      columnDefs: [
        {headerName: 'Bezeichnung', field: 'bezeichnung'},
        {headerName: 'Aufschlag', field: 'aufschlag'},
        {headerName: 'Aufwand', field: 'aufwand'},
        {headerName: 'Anteil an nächster Zwischensumme', field: 'anteilZwischensumme'},
        {headerName: 'Anteil am Gesamtprojekt', field: 'anteilGesamtprojekt'},
      ],
      rowData: [{
        id: 0,
        bezeichnung: 'Gesamtaufwand Durchschnitt',
        aufwand: 20,
        anteilZwischensumme: 20,
        anteilGesamtprojekt: 50,
        zwischensummen_id: null
      },
        {
          id: 1,
          bezeichnung: "Summe",
          aufwand: 20,
          anteilZwischensumme: '',
          anteilGesamtprojekt: '',
          zwischensummen_id: null
        }],
      selectedItem: -1,
      dialog_createAufschlag: false,
      aufschlag_bezeichnung: '',
      aufschlag_wert: 0.0,
    }
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi;
    },
    aufschlagErstellen() {
      this.dialog_createAufschlag = false
      let aufschlag = {
        id: -1,
        bezeichnung: this.aufschlag_bezeichnung,
        aufschlag: this.aufschlag_wert,
        aufwand: 20,
        anteilZwischensumme: 2,
        anteilGesamtprojekt: 50,
        zwischensummen_id: null
      }
      if (this.selectedItem === -1) {
        this.rowData.push(aufschlag)
      } else {
        this.rowData.splice(this.selectedItem + 1, 0, aufschlag);
      }
      for (let i = 0; i < this.rowData.length; i++) {
        this.rowData[i].id = i
      }
      this.aufschlag_bezeichnung = ''
      this.aufschlag_wert = 0.0
    },
    zwischensummeErstellen() {
      let zwischensumme = {
        id: -1,
        bezeichnung: 'Zwischensumme',
        aufschlag: 100,
        aufwand: 150,
        zwischensummen_id: null
      }
      if (this.selectedItem === -1) {
        this.rowData.push(zwischensumme)
      } else {
        this.rowData.splice(this.selectedItem + 1, 0, zwischensumme);
      }
      for (let i = 0; i < this.rowData.length; i++) {
        this.rowData[i].id = i
      }
    }
  }
}
</script>

<style>

</style>
