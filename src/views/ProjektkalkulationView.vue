<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue style="width: 100%;height: 90%"
                 class="ag-theme-alpine"
                 :rowData="rowData"
                 :columnDefs="columnDefs"
                 rowSelection="single"
                 @cellValueChanged="onCellValueChanged"
                 @cellClicked="onCellClicked"
                 :navigateToNextCell="navigateToNextCell"
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
import { AgGridVue } from "ag-grid-vue3";

import { useAufschlaegeStore } from "@/stores/aufschlag";
import { Aufschlag } from "@/Aufschag";
import ProjektkalkulationCellRenderer from "@/components/ProjektkalkulationCellRenderer.vue";
import { nextTick } from "vue";

export default {
  name: "ProjektkalkulationView",
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    ProjektkalkulationCellRenderer
  },
  data() {
    return {
      gridApi: null,
      columnApi: null,
      columnDefs: [
        {
          headerName: "Bezeichnung",
          field: "bezeichnung",
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: ProjektkalkulationCellRenderer,
          cellRendererParams: {
            type: "bezeichnung"
          }
        },
        {
          headerName: "Aufschlag",
          field: "aufschlag",
          valueParser: params => Number(params.newValue),
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: ProjektkalkulationCellRenderer,
          cellRendererParams: {
            type: "aufschlag"
          }
        },
        {
          headerName: "Aufwand",
          field: "aufwand",
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: ProjektkalkulationCellRenderer,
          cellRendererParams: {
            type: "aufwand"
          }
        },
        {
          headerName: "Anteil an nächster Zwischensumme",
          field: "anteilZwischensumme",
          cellRenderer: ProjektkalkulationCellRenderer,
          cellRendererParams: {
            type: "anteilAnZwischensumme"
          }
        },
        {
          headerName: "Anteil am Gesamtprojekt",
          field: "anteilGesamtprojekt",
          cellRenderer: ProjektkalkulationCellRenderer,
          cellRendererParams: {
            type: "anteilAmGesamtprojekt"
          }
        }
      ]
    };
  },
  setup() {
    const aufschlaegeStore = useAufschlaegeStore();
    const rowData = [];
    aufschlaegeStore.getAufschlage.forEach(aufschlag => {
      rowData.push({
        bezeichnung: aufschlag.bezeichnung,
        aufschlag: aufschlag.aufschlag
      });
    });
    return { aufschlaegeStore, rowData };
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      this.berechne();
      this.refreshGrid();
    },
    onCellClicked(params) {
      this.selectedRow = params.data;
    },
    onCellValueChanged(params) {
      let newAufschlag;
      if (params.data.aufschlag === "") newAufschlag = 0;
      else newAufschlag = params.data.aufschlag;
      this.aufschlaegeStore.updateAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]), new Aufschlag(params.data.bezeichnung, newAufschlag));
      this.refreshTable()
    },
    refreshGrid() {
      this.gridApi.forEachNode(function(node) {
        if (node.data.bezeichnung === "ZWISCHENSUMME") node.setRowHeight(80);
      });
      this.gridApi.onRowHeightChanged();
      this.gridApi.refreshCells({ force: true });
    },
    refreshRowData() {
      this.rowData = this.aufschlaegeStore.getAufschlage;
      this.gridApi.setRowData(this.aufschlaegeStore.getAufschlage);
    },
    aufschlagErstellen() {
      if (this.gridApi.getSelectedRows()[0]) {
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return;
        this.aufschlaegeStore.addNewAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]), "beispiel", 0);
        this.refreshTable()
      }
    },
    zwischensummeErstellen() {
      if (this.gridApi.getSelectedRows()[0]) {
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ZWISCHENSUMME") return;
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return;
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "STARTSUMME") return;
        if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "ZWISCHENSUMME") return;
        if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "STARTSUMME") return;
        this.aufschlaegeStore.addNewZwischensumme(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]));
        this.refreshTable();
      }
    },
    zeileEntfernen() {
      if (this.gridApi.getSelectedRows()[0]) {
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return;
        this.aufschlaegeStore.deleteAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]));
        this.refreshTable()
      }
    },
    refreshTable() {
      this.refreshRowData();
      this.berechne();
      this.refreshGrid();
    },
    moveAufschlagDown() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        this.aufschlaegeStore.moveDown(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]))
        this.refreshTable()
      }
    },
    navigateToNextCell(params) {
      const suggestedNextCell = params.nextCellPosition;
      const KEY_UP = "ArrowUp";
      const KEY_DOWN = "ArrowDown";
      const noUpOrDownKeyPressed =
        params.key !== KEY_DOWN && params.key !== KEY_UP;
      if (noUpOrDownKeyPressed || !suggestedNextCell) {
        return suggestedNextCell;
      }
      params.api.forEachNode(function(node) {
        if (node.rowIndex === suggestedNextCell.rowIndex) {
          node.setSelected(true);
        }
      });
      return suggestedNextCell;
    }
  }
};
</script>
