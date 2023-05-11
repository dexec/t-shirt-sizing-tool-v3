<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue
        :columnDefs="columnDefs"
        :defaultColDef='defaultColDef'
        :navigateToNextCell="navigateToNextCell"
        :rowData="rowData"
        class="ag-theme-alpine"
        rowSelection="single"
        style="width: 100%;height: 100%"
        @cellValueChanged="onCellValueChanged"
        @contextmenu="rightClickOnCell"
        @cell-key-down="onCellKeyPress"
        @grid-ready="onGridReady"
    ></ag-grid-vue>
    <div class="wrapper">
      <div class="content">
        <div class="menu">
          <span class="item" @click="aufschlagErstellen">Aufschlag erstellen</span>
          <span class="item" @click="zwischensummeErstellen">Zwischensumme erstellen</span>
          <span class="item" @click="zeileEntfernen">Zeile löschen</span>
        </div>
      </div>
    </div>
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
      defaultColDef: {
        suppressKeyboardEvent: params => {
          let key = params.event.key;
          return params.event.ctrlKey && (key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Delete');
        }
      },
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
    showMenu(e) {
      e.preventDefault();
      const contextMenu = document.querySelector(".wrapper")
      let x = e.clientX
      let y = e.clientY
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.style.display = "block";
      document.addEventListener("click", () => contextMenu.style.display = "none");
    },
    rightClickOnCell(e) {
      this.showMenu(e)
      const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
      this.gridApi.getRowNode(focusedRowIndex).setSelected(true)
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      this.refreshTable();
    },
    onCellValueChanged(params) {
      switch (params.colDef.field) {
        case "bezeichnung":
          this.eintraegeStore.updateBezeichnung(params.rowIndex, params.newValue);
          break;
        case "aufschlagWert":
          if (!isNaN(params.newValue)) this.eintraegeStore.updateAufschlag(params.rowIndex, +params.newValue);
          else params.data.aufschlagWert = params.oldValue;
          break;
        case "aufwandWert":
          if (!isNaN(params.newValue)) this.eintraegeStore.updateAufwand(params.rowIndex, +params.newValue);
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
        //this.rowData = this.eintraegeStore.eintraege;
        this.gridApi.setRowData(this.eintraegeStore.eintraege);
        this.gridApi.forEachNode(function (node) {
          if (node.data.bezeichnung === "ZWISCHENSUMME") node.setRowHeight(80);
        });
        this.gridApi.onRowHeightChanged();
        this.gridApi.refreshCells({force: true});
      });
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


<style scoped>
.wrapper {
  display: none;
  position: absolute;
  width: 280px;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.1);
}

.wrapper .menu {
  padding: 10px 12px;
}

.content .item {
  list-style: none;
  height: 20px;
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  border-radius: 5px;
  margin-bottom: 2px;
  padding: 0 5px 0 10px;
  font-size: 0.8rem;
}

.content .item:hover {
  background: #f2f2f2;
}

.content .item span {
  margin-left: 8px;
  font-size: 19px;
}
</style>

