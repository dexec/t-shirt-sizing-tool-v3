<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue :columnDefs="columnDefs"
                 :navigateToNextCell="navigateToNextCell"
                 :rowData="rowData"
                 class="ag-theme-alpine"
                 rowSelection="single"
                 style="width: 100%;height: 90%"
                 @cellValueChanged="onCellValueChanged"
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

import {useEintraegeStore} from "@/stores/eintraege";
import {nextTick} from "vue";
import BezeichnungCellRenderer from "@/components/projektkalkulation/BezeichnungCellRenderer.vue";
import AufschlagCellRenderer from "@/components/projektkalkulation/AufschlagCellRenderer.vue";
import AufwandCellRenderer from "@/components/projektkalkulation/AufwandCellRenderer.vue";
import AnteilAnZwischensummeCellRenderer from "@/components/projektkalkulation/AnteilAnZwischensummeCellRenderer.vue";
import AnteilAmGesamtprojektCellRenderer from "@/components/projektkalkulation/AnteilAmGesamtprojektCellRenderer.vue";

export default {
  name: "ProjektkalkulationView",
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    BezeichnungCellRenderer,
    // eslint-disable-next-line vue/no-unused-components
    AufschlagCellRenderer,
    // eslint-disable-next-line vue/no-unused-components
    AufwandCellRenderer,
    // eslint-disable-next-line vue/no-unused-components
    AnteilAnZwischensummeCellRenderer,
    // eslint-disable-next-line vue/no-unused-components
    AnteilAmGesamtprojektCellRenderer
  },
  data: function () {
    return {
      gridApi: null,
      columnApi: null,
      columnDefs: [
        {
          headerName: "Bezeichnung",
          field: "bezeichnung",
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: BezeichnungCellRenderer
        },
        {
          headerName: "Aufschlag",
          field: "aufschlagWert",
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: AufschlagCellRenderer
        },
        {
          headerName: "Aufwand",
          field: "aufwandWert",
          editable: params => !(params.data.bezeichnung === "ZWISCHENSUMME" || params.data.bezeichnung === "ENDSUMME" || params.data.bezeichnung === "STARTSUMME"),
          cellRenderer: AufwandCellRenderer
        },
        {
          headerName: "Anteil an nächster Zwischensumme",
          field: "anteilZwischensumme",
          cellRenderer: AnteilAnZwischensummeCellRenderer
        },
        {
          headerName: "Anteil am Gesamtprojekt",
          field: "anteilGesamtprojekt",
          cellRenderer: AnteilAmGesamtprojektCellRenderer
        }
      ]
    };
  },
  setup() {
    const eintraegeStore = useEintraegeStore();
    eintraegeStore.berechne();
    const rowData = eintraegeStore.eintraege;
    return {eintraegeStore: eintraegeStore, rowData};
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      this.refreshGrid();
    },
    onCellValueChanged(params) {
      switch (params.colDef.field) {
        case "bezeichnung":
          this.eintraegeStore.updateBezeichnung(params.rowIndex, params.newValue);
          break;
        case "aufschlagWert":
          if(!isNaN(params.newValue)) this.eintraegeStore.updateAufschlag(params.rowIndex, +params.newValue);
          else params.data.aufschlagWert = params.oldValue;
          break;
        case "aufwandWert":
          if(!isNaN(params.newValue)) this.eintraegeStore.updateAufwand(params.rowIndex, +params.newValue);
          else params.data.aufwandWert = params.oldValue;
          break;
      }
      this.refreshTable();
    },
    aufschlagErstellen() {
      if (this.gridApi.getSelectedRows()[0]) {
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return;
        this.eintraegeStore.addNewAufschlag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]));
        this.refreshTable();
      }
    },
    zwischensummeErstellen() {
      if (this.gridApi.getSelectedRows()[0]) {
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ZWISCHENSUMME") return;
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME") return
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "STARTSUMME") return;
        if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "ZWISCHENSUMME") return;
        if (this.rowData[this.rowData.indexOf(this.gridApi.getSelectedRows()[0]) + 1].bezeichnung === "STARTSUMME") return;
        this.eintraegeStore.addNewZwischensumme(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]));
        this.refreshTable();
      }
    },
    zeileEntfernen() {
      if (this.gridApi.getSelectedRows()[0]) {
        if (this.gridApi.getSelectedRows()[0].bezeichnung === "ENDSUMME" || this.gridApi.getSelectedRows()[0].bezeichnung === "STARTSUMME") return;
        this.eintraegeStore.deleteEintrag(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]));
        this.refreshTable();
      }
    },
    refreshTable() {
      nextTick(() => {
        this.refreshRowData();
        this.refreshGrid();
      });
    },
    refreshRowData() {
      this.rowData = this.eintraegeStore.eintraege;
      this.gridApi.setRowData(this.eintraegeStore.eintraege);
    },
    refreshGrid() {
      this.gridApi.forEachNode(function (node) {
        if (node.data.bezeichnung === "ZWISCHENSUMME") node.setRowHeight(80);
      });
      this.gridApi.onRowHeightChanged();
      this.gridApi.refreshCells({force: true});
    },
    moveAufschlagDown() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        this.eintraegeStore.moveDown(this.rowData.indexOf(this.gridApi.getSelectedRows()[0]));
        this.refreshTable();
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
      params.api.forEachNode(function (node) {
        if (node.rowIndex === suggestedNextCell.rowIndex) {
          node.setSelected(true);
        }
      });
      return suggestedNextCell;
    }
  }
};
</script>
