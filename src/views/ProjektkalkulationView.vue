<template>

  <div class="d-flex flex-row" style="width: 100%;height: 100%">
    <ag-grid-vue
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :rowData="rowData"
        class="ag-theme-alpine"
        rowSelection="single"
        style="width: 65%;height: 100%"
        @cellValueChanged="onCellValueChanged"
        @contextmenu="rightClickOnCell"
        @cell-clicked="onCellClicked"
        @cell-key-down="onCellKeyPress"
        @cell-double-clicked="onCellDoubleClicked"
        @grid-ready="onGridReady"
    ></ag-grid-vue>
    <div style="width:35%; border: 1px solid black">{{ explanationString }}</div>
  </div>
</template>
<script lang="ts" setup>
import BezeichnungCellRenderer from "@/components/projektkalkulation/BezeichnungCellRenderer.vue";
import AufschlagCellRenderer from "@/components/projektkalkulation/AufschlagCellRenderer.vue";
import AufwandCellRenderer from "@/components/projektkalkulation/AufwandCellRenderer.vue";
import AnteilAnZwischensummeCellRenderer from "@/components/projektkalkulation/AnteilAnZwischensummeCellRenderer.vue";
import AnteilAmGesamtprojektCellRenderer from "@/components/projektkalkulation/AnteilAmGesamtprojektCellRenderer.vue";
import {AgGridVue} from "ag-grid-vue3";
import {nextTick, provide, reactive, ref} from "vue";
import {Column, ColumnApi, GridApi} from "ag-grid-community";
import {useEintraegeStore} from "@/stores/eintraege";
import ContextMenu from "@/components/ContextMenu.vue";


const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

function rightClickOnCell(e) {
  contextMenuRef.value!.showMenu(e);
  if (gridApi.value!.getFocusedCell()) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    gridApi.value!.getRowNode(focusedRowIndex + "")!.setSelected(true);
  }
}

provide("eintragErstellen", eintragErstellen);
provide("eintragEntfernen", eintragEntfernen);
provide("zwischensummeErstellen", zwischensummeErstellen);
provide("moveZeileUp", moveZeileUp);
provide("moveZeileDown", moveZeileDown);
const providedFunctions = ref([
  {functionName: "eintragErstellen", functionLabel: "Neuen Eintrag erstellen"},
  {functionName: "eintragEntfernen", functionLabel: "Eintrag entfernen"},
  {functionName: "zwischensummeErstellen", functionLabel: "Neue Zwischensumme erstellen"},
  {functionName: "moveZeileUp", functionLabel: "Eintrag eine Zeile nach oben verschieben", icon: "mdi-arrow-up"},
  {functionName: "moveZeileDown", functionLabel: "Eintrag eine Zeile nach unten verschieben", icon: "mdi-arrow-down"}

]);
const gridApi = ref<GridApi>();
const columnApi = ref<ColumnApi>();

function onGridReady(params) {
  columnApi.value = params.columnApi;
  gridApi.value = params.api;
  refreshTable(columnApi.value!.getColumns()![0].getColId(), 0);
}


const columnDefs = ref([
  {
    field: "bezeichnung",
    headerName: "Bezeichnung",
    cellRenderer: BezeichnungCellRenderer,
    editable: false
  },
  {
    field: "aufschlagWert",
    headerName: "Aufschlag",
    cellRenderer: AufschlagCellRenderer,
    cellStyle: {},
    editable: false
  },
  {
    field: "aufwandWert",
    headerName: "Aufwand",
    cellRenderer: AufwandCellRenderer,
    cellStyle: {},
    editable: false
  },
  {
    field: "anteilZwischensumme",
    headerName: "Anteil an nächster Zwischensumme",
    cellRenderer: AnteilAnZwischensummeCellRenderer,
    cellStyle: {},
    editable: false
  },
  {
    field: "anteilGesamtprojekt",
    headerName: "Anteil am Gesamtprojekt",
    cellRenderer: AnteilAmGesamtprojektCellRenderer,
    cellStyle: {},
    editable: false
  }]);
const defaultColDef = reactive(
    {
      suppressKeyboardEvent: params => {
        let key = params.event.key;
        return (params.event.ctrlKey || params.event.shiftKey) && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Delete", "Enter", "F2"].includes(key) || ["Delete", "Enter", "F2", "Escape"].includes(key);
      }
    }
);
const eintraegeStore = useEintraegeStore();
eintraegeStore.berechne();
const rowData = eintraegeStore.eintraege;


function onCellDoubleClicked(e) {
  if (gridApi.value!.getEditingCells().length === 0 && (["bezeichnung", "aufschlagWert", "aufwandWert"].includes(e.colDef.field) && !["STARTSUMME", "ZWISCHENSUMME", "ENDSUMME"].includes(e.data.bezeichnung))) {
    startEditingCell(e, e.column.colId);
  }
}

function onCellEditingStopped(e) {

}

const explanationString = ref("");

function onCellClicked(e) {
  columnDefs.value!.forEach(column => {
    column.editable = false;
    column.cellStyle = {};
  });
  switch (e.colDef.field) {
    case "bezeichnung":
      break;
    case "aufschlagWert": {
      clickedAufschlagOrAufwand(e.data.bezeichnung, "aufschlagWert", e.rowIndex);
      break;
    }
    case "aufwandWert":
      clickedAufschlagOrAufwand(e.data.bezeichnung, "aufwandWert", e.rowIndex);
      break;
    case "anteilZwischensumme":
      clickedAnteilZwischensumme(e.data.bezeichnung, e.rowIndex);
      break;
    case "anteilGesamtprojekt":
      clickedOnAnteilGesamtprojekt(e.data.bezeichnung, e.rowIndex);
      break;
  }
  refreshTable(e.column.colId, e.rowIndex)
}

function clickedAufschlagOrAufwand(bezeichnung: string, column: string, rowIndex: number) {
  const columnNeighbor = column == "aufschlagWert" ? "aufwandWert" : "aufschlagWert"
  if (!["ZWISCHENSUMME", "STARTSUMME", "ENDSUMME"].includes(bezeichnung)) {
    for (let i = rowIndex; i >= 0; i--) {
      if (["STARTSUMME", "ZWISCHENSUMME"].includes(rowData[i].bezeichnung)) {
        columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == column)!.cellStyle = (params: any) => {
          if (params.rowIndex == i && column == "aufwandWert") return {'background-color': 'blue', color: 'white'}
          if (params.rowIndex == rowIndex) return {'background-color': 'red', color: 'white'}
          return {color: 'black'}
        }
        columnDefs.value.find(column => column.field == columnNeighbor)!.cellStyle = (params: any) => {
          if (params.rowIndex == i && column == "aufschlagWert") return {'background-color': 'blue', color: 'white'}
          if (params.rowIndex == rowIndex) return {'background-color': 'green', color: 'white'};
          return {color: 'black'};
        }
        break;
      }
    }
  } else if (bezeichnung == "ZWISCHENSUMME") {
    const vorigerAbschnittEintraege: number[] = [];
    for (let i = rowIndex - 1; !["STARTSUMME", "ZWISCHENSUMME"].includes(rowData[i].bezeichnung); i--) {
      vorigerAbschnittEintraege.push(i);
    }
    columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == column)!.cellStyle = (params: any) => {
      if (params.rowIndex == rowIndex) return {'background-color': 'red', color: 'white'}
      if (vorigerAbschnittEintraege.includes(params.rowIndex)) return {'background-color': 'green', color: 'white'}
      if (params.rowIndex == 0 && column == "aufwandWert") return {'background-color': 'blue', color: 'white'};
      return {color: 'black'}
    }
  }
}

function clickedAnteilZwischensumme(bezeichnung: string, rowIndex: number) {
  if (!["ZWISCHENSUMME", "STARTSUMME", "ENDSUMME"].includes(bezeichnung)) {
    for (let i = rowIndex; i < rowData.length; i++) {
      if (["ZWISCHENSUMME", "ENDSUMME"].includes(rowData[i].bezeichnung)) {
        columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == "aufwandWert")!.cellStyle = (params: any) => {
          if (params.rowIndex == i) return {'background-color': 'blue', color: 'white'}
          if (params.rowIndex == rowIndex) return {'background-color': 'green', color: 'white'}
          return {color: 'black'}
        }
        columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == "anteilZwischensumme")!.cellStyle = (params: any) => {
          if (params.rowIndex == rowIndex) return {'background-color': 'red', color: 'white'}
          return {color: 'black'}
        }
        break;
      }
    }
  } else if (bezeichnung == "ZWISCHENSUMME") {
    const vorigerAbschnittEintraege: number[] = [];
    for (let i = rowIndex - 1; !["STARTSUMME", "ZWISCHENSUMME"].includes(rowData[i].bezeichnung); i--) {
      vorigerAbschnittEintraege.push(i);
    }
    columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == "aufwandWert")!.cellStyle = (params: any) => {
      if (params.rowIndex == rowIndex) return {'background-color': 'blue', color: 'white'}
      if (vorigerAbschnittEintraege.includes(params.rowIndex)) return {'background-color': 'green', color: 'white'}
      return {color: 'black'}
    }
    columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == "anteilZwischensumme")!.cellStyle = (params: any) => {
      if (params.rowIndex == rowIndex) return {'background-color': 'red', color: 'white'}
      return {color: 'black'}
    }
  }
}

function clickedOnAnteilGesamtprojekt(bezeichnung: string, rowIndex: number) {
  if (!["STARTSUMME", "ENDSUMME"].includes(bezeichnung)) {
    columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == "aufwandWert")!.cellStyle = (params: any) => {
      if (params.rowIndex == rowIndex) return {'background-color': 'green', color: 'white'}
      if(params.rowIndex==rowData.length-1) return {'background-color': 'blue', color: 'white'}
      return {color: 'black'}
    }
    columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == "anteilGesamtprojekt")!.cellStyle = (params: any) => {
      if (params.rowIndex == rowIndex) return {'background-color': 'red', color: 'white'}
      return {color: 'black'}
    }
  }
}

function onCellValueChanged(e) {
  switch (e.colDef.field) {
    case "bezeichnung":
      eintraegeStore.updateBezeichnung(e.rowIndex, e.newValue);
      break;
    case "aufschlagWert":
      if (!isNaN(e.newValue)) eintraegeStore.updateAufschlag(e.rowIndex, +e.newValue);
      else e.data.aufschlagWert = e.oldValue;
      break;
    case "aufwandWert":
      if (!isNaN(e.newValue)) eintraegeStore.updateAufwand(e.rowIndex, +e.newValue);
      else e.data.aufwandWert = e.oldValue;
      break;
  }
  refreshTable(e.column.colId, e.rowIndex)
}

function onCellKeyPress(e) {
  if (e.event) {
    const key = e.event.key;
    const ctrl = e.event.ctrlKey;
    const shift = e.event.shiftKey;
    const alt = e.event.altKey;
    const colKey = e.column.colId;
    if (gridApi.value!.getEditingCells().length === 0) {
      switch (key) {
        case "ArrowDown":
          if (e.data.bezeichnung == "STARTSUMME" && (shift || ctrl)) {
            refreshTable(e.column, 1);
          } else if (shift || ctrl) {
            moveZeileDown();
          } else {
            const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
            const selectedPaket = gridApi.value!.getRowNode(focusedRowIndex + "");
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
          }
          break;
        case "ArrowUp":
          if (e.data.bezeichnung == "ENDSUMME" && (shift || ctrl)) {
            refreshTable(e.column, rowData.length - 2);
          } else if (shift || ctrl) {
            moveZeileUp();
          } else {
            const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
            const selectedPaket = gridApi.value!.getRowNode(focusedRowIndex + "");
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
          }
          break;
        case "_":
        case "-":
          if (!ctrl) eintragEntfernen();
          break;
        case "Delete":
          if (shift || ctrl) {
            eintragEntfernen();
          } else {
            if (!["anteilZwischensumme", "anteilGesamtprojekt"].includes(colKey) && e.data.bezeichnung != "ZWISCHENSUMME") {
              if (colKey == "aufwandWert") {
                eintraegeStore.updateAufwand(e.rowIndex, 0);
              } else if (colKey == "aufschlagWert") {
                eintraegeStore.updateAufschlag(e.rowIndex, 0);
              } else if (colKey == "bezeichnung") {
                eintraegeStore.updateBezeichnung(e.rowIndex, "");
              }
              refreshTable(colKey, e.rowIndex);
            }
          }
          break;
        case "+" :
          if (!ctrl)
            eintragErstellen();
          break;
        case "*":
          if (!ctrl)
            zwischensummeErstellen();
          break;
        case "F2":
          if (["bezeichnung", "aufschlagWert", "aufwandWert"].includes(colKey) && !["STARTSUMME", "ZWISCHENSUMME", "ENDSUMME"].includes(e.data.bezeichnung)) {
            columnDefs.value!.find(column => column.field == colKey)!.editable = true;
            nextTick(() => gridApi.value!.startEditingCell({
              rowIndex: e.rowIndex,
              colKey: e.column
            }));
          }
          break;
      }
    } else {
      switch (key) {
        case "Enter":
          stopEiditingAndSetFocus(false, e.rowIndex, colKey);
          break;
        case "Escape":
          stopEiditingAndSetFocus(true, e.rowIndex, colKey);
          break;
      }
    }
  }
}

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  gridApi.value!.stopEditing(cancel);
  columnDefs.value!.forEach(column => column.editable = false);
  gridApi.value!.setFocusedCell(rowIndex, colKey);
  refreshTable(colKey, rowIndex)
}

function startEditingCell(e, colKey: string) {
  if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
    columnDefs.value!.find(column => column.field === colKey)!.editable = true;
    nextTick(() => gridApi.value!.startEditingCell({
      rowIndex: e.rowIndex,
      colKey: e.column
    }));
  }
}

function eintragErstellen() {
  if (gridApi.value!.getSelectedRows()[0] && gridApi.value!.getSelectedRows()[0].bezeichnung !== "ENDSUMME") {
    const rowIndexSelectedRow = rowData.indexOf(gridApi.value!.getSelectedRows()[0]);
    eintraegeStore.addNewAufschlag(rowIndexSelectedRow);
    refreshTable(columnApi.value!.getColumns()![0].getColId(), rowIndexSelectedRow + 1);
  }
}

function zwischensummeErstellen() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedCell = gridApi.value!.getFocusedCell();
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    const bezeichnungSelectedRowUnder = rowData[focusedCell!.rowIndex + 1].bezeichnung;
    if (!["ZWISCHENSUMME", "ENDSUMME", "STARTSUMME"].includes(bezeichnungSelectedRow) && !["ZWISCHENSUMME", "STARTSUMME"].includes(bezeichnungSelectedRowUnder)) {
      eintraegeStore.addNewZwischensumme(focusedCell!.rowIndex);
      refreshTable(focusedCell!.column, focusedCell!.rowIndex + 1);
    }
  }
}

function eintragEntfernen() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedCell = gridApi.value!.getFocusedCell();
    const focusedRowIndex = focusedCell!.rowIndex;
    const focusedRowColKey = focusedCell!.column;
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    if (!["ENDSUMME", "STARTSUMME"].includes(bezeichnungSelectedRow)) {
      eintraegeStore.deleteEintrag(focusedRowIndex);
      if (rowData[focusedRowIndex]) refreshTable(focusedRowColKey, focusedRowIndex);
      else if (rowData.length !== 0) {
        refreshTable(focusedRowColKey, rowData.length - 1);
      } else {
        refreshTable(focusedRowColKey);
      }
    }
  }
}

function moveZeileUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    if (!["ENDSUMME", "STARTSUMME"].includes(bezeichnungSelectedRow)) {
      const focusedCell = gridApi.value!.getFocusedCell();
      const focusedRowIndex = focusedCell!.rowIndex;
      const focusedRowColKey = focusedCell!.column;
      eintraegeStore.moveUp(gridApi.value!.getFocusedCell()!.rowIndex);
      refreshTable(focusedRowColKey, focusedRowIndex - 1);
    }
  }
}

function moveZeileDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    const focusedCell = gridApi.value!.getFocusedCell();
    const focusedRowIndex = focusedCell!.rowIndex;
    const bezeichnungSelectedRowUnder = rowData[focusedCell!.rowIndex + 1].bezeichnung;
    if (bezeichnungSelectedRowUnder !== "ENDSUMME" && !["ENDSUMME", "STARTSUMME"].includes(bezeichnungSelectedRow)) {
      const focusedRowColKey = focusedCell!.column;
      eintraegeStore.moveDown(focusedRowIndex);
      refreshTable(focusedRowColKey, focusedRowIndex + 1);
    }
  }
}

function refreshTable(colKey?: Column | string, rowIndex?: number) {
  nextTick(() => {
    //this.rowData = this.eintraegeStore.eintraege;
    gridApi.value!.setRowData(eintraegeStore.eintraege);
    gridApi.value!.forEachNode(function (node) {
      if (node.data.bezeichnung === "ZWISCHENSUMME") node.setRowHeight(80);
    });
    gridApi.value!.onRowHeightChanged();
    columnDefs.value!.forEach(column => column.editable = false);
    if (rowIndex != undefined && colKey != undefined) {
      gridApi.value!.getRowNode(rowIndex + "")!.setSelected(true);
      gridApi.value!.setFocusedCell(rowIndex, colKey);
    }
    gridApi.value!.refreshCells({force: true});
  });
}

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

