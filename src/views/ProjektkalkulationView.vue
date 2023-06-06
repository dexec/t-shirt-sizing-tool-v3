<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue
        :columnDefs="columnDefs"
        :defaultColDef='defaultColDef'
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
          return (params.event.ctrlKey || params.event.shiftKey) && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(key) || this.suppressedKeysArray.includes(key);
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
    const printableChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!"£$%^&amp;*()_+-=[];\\\'#,. /\\|<>?:@~{}'
    const suppressedKeysArray = [];
    for (let char of printableChar)
      suppressedKeysArray.push(char)
    return {eintraegeStore, rowData, suppressedKeysArray};
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
      this.refreshTable("bezeichnung", 0)
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
      this.refreshTable(params.colDef, params.rowIndex);
    },
    aufschlagErstellen() {
      if (this.gridApi.getSelectedRows()[0] && this.gridApi.getSelectedRows()[0].bezeichnung !== "ENDSUMME") {
        const rowIndexNewAufschlag = this.rowData.indexOf(this.gridApi.getSelectedRows()[0])
        this.eintraegeStore.addNewAufschlag(rowIndexNewAufschlag);
        this.refreshTable("bezeichnung", rowIndexNewAufschlag);
      }
    },
    zwischensummeErstellen() {
      if (this.gridApi.getSelectedRows()[0]) {
        const focusedCell = this.gridApi.getFocusedCell();
        const bezeichnungSelectedRow = this.gridApi.getSelectedRows()[0].bezeichnung;
        const bezeichnungSelectedRowUnder = this.rowData[focusedCell.rowIndex + 1].bezeichnung
        if (bezeichnungSelectedRow !== "ZWISCHENSUMME" && bezeichnungSelectedRowUnder !== "ZWISCHENSUMME" && bezeichnungSelectedRow !== "ENDSUMME" && bezeichnungSelectedRow !== "STARTSUMME" && bezeichnungSelectedRowUnder !== "STARTSUMME") {
          this.eintraegeStore.addNewZwischensumme(focusedCell.rowIndex);
          this.refreshTable(focusedCell.column, focusedCell.rowIndex);
        }
      }
    },
    zeileEntfernen() {
      if (this.gridApi.getSelectedRows()[0]) {
        const focusedCell = this.gridApi.getFocusedCell();
        const focusedRowIndex = focusedCell.rowIndex;
        const focusedRowColKey = focusedCell.column;
        const bezeichnungSelectedRow = this.gridApi.getSelectedRows()[0].bezeichnung;
        if (bezeichnungSelectedRow !== "ENDSUMME" && bezeichnungSelectedRow !== "STARTSUMME") {
          this.eintraegeStore.deleteEintrag(focusedRowIndex);
          if (this.rowData[focusedRowIndex]) this.refreshTable(focusedRowColKey, focusedRowIndex)
          else if (this.rowData.length !== 0) {
            this.refreshTable(focusedRowColKey, this.rowData.length - 1);
          } else {
            this.refreshTable(focusedRowColKey, null)
          }
        }
      }
    },
    refreshTable(colKey, rowIndex) {
      nextTick(() => {
        //this.rowData = this.eintraegeStore.eintraege;
        this.gridApi.setRowData(this.eintraegeStore.eintraege);
        this.gridApi.forEachNode(function (node) {
          if (node.data.bezeichnung === "ZWISCHENSUMME") node.setRowHeight(80);
        });
        this.gridApi.onRowHeightChanged();
        if (rowIndex !== null) {
          this.gridApi.getRowNode(rowIndex).setSelected(true);
          this.gridApi.setFocusedCell(rowIndex, colKey);
        } else {
          this.gridApi.setFocusedCell(null)
        }
        this.gridApi.refreshCells({force: true});
      });
    },
    moveZeileDown() {
      if (this.gridApi.getSelectedRows()[0]) {
        const bezeichnungSelectedRow = this.gridApi.getSelectedRows()[0].bezeichnung;
        const focusedCell = this.gridApi.getFocusedCell();
        const focusedRowIndex = focusedCell.rowIndex;
        const bezeichnungSelectedRowUnder = this.rowData[focusedCell.rowIndex + 1].bezeichnung
        if (bezeichnungSelectedRowUnder !== "ENDSUMME" && bezeichnungSelectedRow !== "ENDSUMME" && bezeichnungSelectedRow !== "STARTSUMME") {
          const focusedRowColKey = focusedCell.column;
          this.eintraegeStore.moveDown(focusedRowIndex);
          this.refreshTable(focusedRowColKey, focusedRowIndex + 1)
        }
      }
    },
    moveZeileUp() {
      if (this.gridApi.getSelectedRows()[0]) {
        const bezeichnungSelectedRow = this.gridApi.getSelectedRows()[0].bezeichnung;
        if (bezeichnungSelectedRow !== "ENDSUMME" && bezeichnungSelectedRow !== "STARTSUMME") {
          const focusedCell = this.gridApi.getFocusedCell();
          const focusedRowIndex = focusedCell.rowIndex;
          const focusedRowColKey = focusedCell.column;
          this.eintraegeStore.moveUp(this.gridApi.getFocusedCell().rowIndex);
          this.refreshTable(focusedRowColKey, focusedRowIndex - 1)
        }
      }
    },
    onCellKeyPress(e) {
      if (e.event) {
        let key = e.event.key
        let ctrl = e.event.ctrlKey;
        let shift = e.event.shiftKey;
        if (this.gridApi.getEditingCells().length === 0)
          switch (key) {
            case 'ArrowUp':
              if (ctrl) {
                this.moveZeileUp()
              } else {
                const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
                const selectedPaket = this.gridApi.getRowNode(focusedRowIndex)
                if (selectedPaket) {
                  selectedPaket.setSelected(true)
                }
              }
              break;
            case 'ArrowDown':
              if (ctrl) {
                this.moveZeileDown()
              } else {
                const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
                const selectedPaket = this.gridApi.getRowNode(focusedRowIndex)
                if (selectedPaket) {
                  selectedPaket.setSelected(true)
                }
              }
              break;
            case 'Delete':
              if (ctrl) this.zeileEntfernen();
              break;
            case '+' :
              this.aufschlagErstellen();
              break;
            case '*': {
              this.zwischensummeErstellen()
              break;
            }
          }
      }
    },
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

