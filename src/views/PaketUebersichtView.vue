<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue
        style="width: 100%;height: 90%"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        rowSelection="single"
        animateRows="true"
        :rowData="rowData"
        @grid-ready="onGridReady"
        @first-data-rendered="onFirstDataRendered"></ag-grid-vue>
    <v-card class="d-flex justify-center fixed">
      <v-btn class="mx-5" @click="addNew">Neues Arbeitspaket anlegen</v-btn>
      <v-btn class="mx-5" @click="removeItem">Arbeitspaket löschen</v-btn>
      <v-btn class="mx-5">Bucket zuweisen</v-btn>
    </v-card>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";

const items = []
for (let i = 0; i < 30; i++) {
  items.push({
    ticket_nr: '123',
    thema: 'UI erstellen',
    beschreibung: 'Es soll eine UI erstellt werden',
    komponente: 'A',
    bucket: 'S',
    schaetzung: '321',
  })
}

export default {
  name: "PaketUebersichtView",
  data() {
    return {
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: true
      },
      columnDefs: [
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
          minWidth: 5,
        },
        {
          field: 'thema',
          headerName: 'Thema',
        },
        {
          field: 'beschreibung',
          headerName: 'Beschreibung',
        },
        {
          field: 'komponente',
          headerName: 'Komponente',
        },
        {
          field: 'bucket',
          headerName: 'Bucket',
          editable: false
        },
        {
          field: 'schaetzung',
          headerName: 'Schätzung',
        },
      ],
      rowData: items,
      gridApi: null,
      columnApi: null,
    }
  },
  components: {
    AgGridVue,
  },
  methods: {
    onFirstDataRendered(params) {
      params.api.sizeColumnsToFit();
      params.columnApi.autoSizeColumns()
    },
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi;
    },
    deselect() {
      this.gridApi.deselectAll()
    }
  }
}

</script>

<style>

</style>
