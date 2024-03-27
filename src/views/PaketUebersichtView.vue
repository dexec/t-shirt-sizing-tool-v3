<template>
  <div style="height: 100%;display:flex;flex-direction: row;overflow: hidden; flex-grow: 1 ">
    <ag-grid-vue
      :cacheQuickFilter="true"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :getRowId="getRowId"
      :rowData="rowData"
      :stopEditingWhenCellsLoseFocus="false"
      class="ag-theme-alpine"
      rowSelection="single"
      style="width: 100%;height: 100%"
      @cellValueChanged="onCellValueChanged"
      @contextmenu="rightClickOnCell"
      @cell-key-down="onCellKeyPress"
      @cell-clicked="onCellClicked"
      @cell-double-clicked="onCellDoubleClicked"
      @grid-ready="onGridReady">
    </ag-grid-vue>
  </div>
  <v-btn v-if="rowData.length==0" class="centeredButton" @click="addNewPaket">Neues Paket erstellen</v-btn>
  <v-text-field bg-color="white" class="searchfield" label="" placeholder="Paket suchen" readonly
                @click="toggleSuche()"></v-text-field>
  <SuchComponent v-if="showSuche" :show-searched-paket="showSearchedPaket" :toggle-suche="toggleSuche"
                 style="height: 100%"></SuchComponent>
  <ContextMenu ref="contextMenuRef" :providedFunctionsProp="[...providedFunctionsContextMenu]"></ContextMenu>
  <ConfirmDialog v-model="showDialog" @cancel="cancelDeletePaket" @confirm="deletePaket">
    <template #question>Möchten Sie das Paket wirklich löschen?</template>
    <template #confirmText>Bestätigen</template>
    <template #cancelText>Abbrechen</template>
  </ConfirmDialog>
</template>
<script lang="ts" setup>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridVue } from "ag-grid-vue3";
import TreeDataCellRenderer from "@/components/TreeDataCellRenderer.vue";

import { usePaketeStore } from "@/stores/pakete";
import { nextTick, provide, reactive, ref } from "vue";
import { useBucketsStore } from "@/stores/buckets";
import { useToast } from "vue-toastification";
import ContextMenu from "@/components/ContextMenu.vue";
import { useProjektStore } from "@/stores/projekt";
import { Column, GridApi } from "ag-grid-community";
import type { ColDef } from "ag-grid-community";
import type { Bucket } from "@/models/Bucket";
import SuchComponent from "@/components/SuchComponent.vue";
import type { Paket } from "@/models/Paket";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { errorToastPaketNrEmpty, errorToastPaketNrNotUnique } from "@/models/Toasts";
import WarningCellRenderer from "@/components/cellRenderers/WarningCellRenderer.vue";

const toast = useToast();
const projectStore = useProjektStore();
const gridApi = ref<GridApi>();
let getRowId = (params: any): number => params.data._id;
const paketeStore = usePaketeStore();
const rowData = paketeStore.paketeAsTreeView;
let duplicateTicketNrFound = false;

function onGridReady(params: any) {
  gridApi.value = params.api;
  //TODO Grid soll warten bis resiszed wude
  gridApi.value!.autoSizeColumns(["ticket_nr"]);
  window.addEventListener("resize", function() {
    setTimeout(function() {
      gridApi.value!.autoSizeColumns(["ticket_nr"]);
    });
  });
}


const defaultColDef = reactive({
  /* resizable: true,*/ /*filter: "agTextColumnFilter",*/
  suppressKeyboardEvent: (params: any) => {
    let key = params.event.key;
    return (params.event.ctrlKey || params.event.shiftKey) && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Delete", "Enter", "F2"].includes(key) || ["Delete", "Enter", "F2", "Escape"].includes(key) /*|| suppressedKeysArray.includes(key)*/;
  }
});
const columnDefs:ColDef[] = [
  {
    field: "ticket_nr",
    headerName: "Ticket-NR",
    valueSetter:(params: any):any => {
      if (params.newValue == "") {
        params.data.ticket_nr = params.oldValue;
        errorToastPaketNrEmpty();
      } else {
        duplicateTicketNrFound = false;
        const everyTicketNrArray = Array.from(paketeStore.paketeAsMap.values()).map(paket => paket.ticket_nr);
        for (const ticketnr of everyTicketNrArray) {
          if (params.newValue.toUpperCase() == ticketnr.toUpperCase()) {
            duplicateTicketNrFound = true;
            break;
          }
        }
        if (!duplicateTicketNrFound) params.data.ticket_nr = params.newValue;
        else {
          errorToastPaketNrNotUnique();
        }
      }
    },
    cellRenderer: TreeDataCellRenderer,
    editable: false
  },
  {
    field:"id",
    headerName: "id",
    editable: false
  },
  {
    field: "thema",
    headerName: "Thema",
    editable: false
  },
  {
    field: "beschreibung",
    headerName: "Beschreibung",
    editable: false,
    flex: 3,
    suppressSizeToFit: true
  },
  {
    field: "komponente",
    headerName: "Komponente",
    editable: false
  },
  {
    field: "bucket",
    headerName: "Bucket",
    valueSetter: (params: any):any => {
      if (params.newValue === "") paketeStore.updateBucket(params.data, null);
      else {
        const bucket = useBucketsStore().bucketsAsSortedArray.find(bucket => bucket.name === params.newValue) as Bucket;
        paketeStore.updateBucket(params.data, bucket);
      }
    },
    valueGetter: (params: any) => {
      if (params.data.bucket) return params.data.bucket.name;
      else return "";
    },
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["", ...useBucketsStore().getBucketNamesSorted()]
    },
    cellStyle: (params: any): any => {
      if (params.data.children.length > 0) return { backgroundColor: "lightgrey" };
      else return { backgroundColor: "transparent" };
    },
    hide: !projectStore.bucketmodus,
    editable: false,
    maxWidth: 200
  },
  {
    field: "schaetzung",
    headerName: "Schätzung",
    valueSetter: (params: any):any => {
      const newValue = params.newValue.replace(",", ".");
      if (isNaN(newValue)) params.data.schaetzung = params.oldValue;
      else {
        params.data.schaetzung = Number(newValue);
        paketeStore.berechneSchaetzungen();
        gridApi.value!.refreshCells({ force: true });
      }
    },
    valueGetter: (params: any) => {
      if (params.data.schaetzung) {
        if (params.data.children.length > 0) {
          return params.data.schaetzung.toFixed(projectStore.nachkommastellen);
        } else return params.data.schaetzung;
      }
    },
    cellStyle: (params: any): any => {
      if (params.data.children.length > 0) return { backgroundColor: "lightgrey" };
      else return { backgroundColor: "transparent" };
    },
    filter: "agNumberColumnFilter",
    editable: false,
    maxWidth: 200
  },
  {
    headerName: "",
    field: "warning",
    cellRenderer: WarningCellRenderer,
    maxWidth: 50,
    editable:false
  }
];
const showSuche = ref(false);

function toggleSuche() {
  showSuche.value = !showSuche.value;
}

function showSearchedPaket(paket: Paket) {
  showSuche.value = false;
  paketeStore.showPaket(paket);
  refreshTable(gridApi.value!.getColumns()![0].getColId(), paket.id);
}

const showDialog = ref(false);

function attemptDeletePaket() {
  showDialog.value = true;
}

function cancelDeletePaket() {
  const focusedRow = gridApi.value!.getFocusedCell();
  const focusedRowIndex = focusedRow!.rowIndex;
  const focusedColumn = focusedRow!.column;
  nextTick(() => {
    if (rowData[focusedRowIndex]) {
      refreshTable(focusedColumn, rowData[focusedRowIndex].id);
    }
  });
}

provide("addNewPaket", addNewPaket);
provide("addNewKindPaket", addNewKindPaket);
provide("attemptDeletePaket", attemptDeletePaket);
provide("movePaketUp", movePaketUp);
provide("movePaketDown", movePaketDown);
provide("movePaketRightUp", movePaketRightUp);
provide("movePaketRightDown", movePaketRightDown);
provide("movePaketLeftDown", movePaketLeftDown);
provide("movePaketLeftUp", movePaketLeftUp);
const providedFunctionsContextMenu = ref([
  { functionName: "addNewPaket", functionLabel: "Neues Arbeitspaket anlegen" },
  { functionName: "addNewKindPaket", functionLabel: "Neues Arbeitspaket als Kind anlegen" },
  { functionName: "attemptDeletePaket", functionLabel: "Paket löschen" },
  { functionName: "movePaketUp", functionLabel: "Pfeil hoch", icon: "mdi-arrow-up" },
  { functionName: "movePaketDown", functionLabel: "Pfeil runter", icon: "mdi-arrow-down" },
  { functionName: "movePaketRightUp", functionLabel: "Pfeil hoch rechts", icon: "mdi-arrow-top-right" },
  { functionName: "movePaketRightDown", functionLabel: "Pfeil runter rechts", icon: "mdi-arrow-bottom-right" },
  { functionName: "movePaketLeftDown", functionLabel: "Pfeil runter links", icon: "mdi-arrow-bottom-left" },
  { functionName: "movePaketLeftUp", functionLabel: "Pfeil hoch links", icon: "mdi-arrow-top-left" }
]);
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

function rightClickOnCell(e: any) {
  contextMenuRef.value!.showMenu(e);
  const focusedCell = gridApi.value!.getFocusedCell();
  if (focusedCell != null && rowData.length > 0) {
    const focusedRowIndex = focusedCell.rowIndex;
    gridApi.value!.getDisplayedRowAtIndex(focusedRowIndex)!.setSelected(true);
  }
}

function onCellClicked() {
  columnDefs.forEach(column => column.editable = false);
  gridApi.value!.setGridOption("columnDefs",columnDefs)
}

function onCellDoubleClicked(e: any) {
  if (gridApi.value!.getEditingCells().length === 0) {
    startEditingCell(e, e.column.colId);
  }
}

function onCellValueChanged(params: any) {
  gridApi.value!.autoSizeColumns(["ticket_nr"]);
}

function addNewPaket() {
  let newPaketID;
  if (gridApi.value!.getSelectedRows()[0]) {
    newPaketID = paketeStore.addNew(gridApi.value!.getSelectedRows()[0].id);
    refreshTable(gridApi.value!.getFocusedCell()!.column, newPaketID);
  } else {
    newPaketID = paketeStore.addNew(-1);
    refreshTable(gridApi.value!.getColumns()![0].getColId(), newPaketID);
  }
}

function addNewKindPaket() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const newPaketID = paketeStore.addNewChild(gridApi.value!.getSelectedRows()[0].id);
    refreshTable(gridApi.value!.getFocusedCell()!.column, newPaketID);
  }
}

function deletePaket() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    const focusedColumn = gridApi.value!.getFocusedCell()?.column!;
    paketeStore.deletePaket(gridApi.value!.getSelectedRows()[0].id);
    //TODO Aktualisiert die Grid Size nicht irgendwie
    nextTick(() => {
      if (rowData[focusedRowIndex]) refreshTable(focusedColumn, rowData[focusedRowIndex].id);
      else if (rowData.length !== 0) {
        refreshTable(focusedColumn, rowData[rowData.length - 1].id);
      } else {
        refreshTable(focusedColumn.getColId());
      }
    });
  }
}

function movePaketUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketeStore.moveUp(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketeStore.moveDown(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketLeftUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketeStore.moveLeftUp(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketLeftDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketeStore.moveLeftDown(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketRightDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketeStore.moveRightDown(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketRightUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketeStore.moveRightUp(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function refreshTable(colKey?: Column | string, paketId?: number) {
  nextTick(() => {
    gridApi.value!.setGridOption('rowData',paketeStore.paketeAsTreeView);
    columnDefs.forEach(column => column.editable = false);
    gridApi.value!.setGridOption("columnDefs", columnDefs);
    if (paketId != undefined && colKey != undefined) {
      gridApi.value!.getRowNode(paketId + "")!.setSelected(true);
      gridApi.value!.setFocusedCell(gridApi.value!.getRowNode(paketId + "")!.rowIndex as number, colKey);
    }
    gridApi.value!.refreshCells({ force: true });
    gridApi.value!.autoSizeColumns(["ticket_nr", "thema"]);
  });
}

function onCellKeyPress(e: any) {
  if (e.event) {
    const key = e.event.key;
    const ctrl = e.event.ctrlKey;
    const shift = e.event.shiftKey;
    const colKey = e.column.colId;
    if (gridApi.value!.getEditingCells().length === 0) {
      switch (key) {
        case "ArrowUp":
          if (ctrl || shift) {
            nextTick(() => movePaketUp());
          } else {
            const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
            const selectedPaket = rowData[focusedRowIndex];
            if (selectedPaket) {
              gridApi.value!.getRowNode(selectedPaket.id + "")!.setSelected(true);
            }
          }
          break;
        case "ArrowDown":
          if (ctrl || shift) {
            nextTick(() => movePaketDown());
          } else {
            const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
            const selectedPaket = rowData[focusedRowIndex];
            if (selectedPaket) {
              gridApi.value!.getRowNode(selectedPaket.id + "")!.setSelected(true);
            }
          }
          break;
        case "ArrowLeft":
          if (ctrl) nextTick(() => movePaketLeftDown());
          else if (shift) nextTick(() => movePaketLeftUp());
          break;
        case "ArrowRight":
          if (ctrl) nextTick(() => movePaketRightDown());
          else if (shift) nextTick(() => movePaketRightUp());
          break;
        case "Delete":
          if (shift || ctrl) {
            nextTick(() => attemptDeletePaket());
          } else {
            if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
              if (colKey === "schaetzung") {
                const oldValue = e.data.schaetzung;
                e.data.schaetzung = null;
                nextTick(() => paketeStore.berechneSchaetzungen());
              } else if (colKey === "bucket") {
                nextTick(() => paketeStore.updateBucket(e.data, null));
              } else if (!(colKey === "ticket_nr")) e.data[colKey] = null;
              refreshTable(colKey, e.data.id);
            }
          }
          break;
        case "+":
          if (!ctrl && !shift)
            nextTick(() => addNewPaket());
          else if (shift) {
            nextTick(() => addNewKindPaket());
          }
          break;
        case "*": {
          if (!ctrl)
            nextTick(() => addNewKindPaket());
          break;
        }
        case " ":
          if (ctrl) {
            if (e.data.children.length > 0) {
              const aktuellesPaket = e.data;
              aktuellesPaket.open = !aktuellesPaket.open;
              e.node.setData(aktuellesPaket);
              nextTick(() => paketeStore.updateTreeViewAfterChangedOpenState(aktuellesPaket));
              refreshTable(colKey, e.data.id);
            }
          }
          break;
        case "F2":
          nextTick(() => startEditingCell(e, colKey));
          break;
      }
    } else {
      switch (key) {
        case "Enter": {
          nextTick(() => stopEiditingAndSetFocus(false, e.rowIndex, colKey));
          break;
        }
        case "Escape": {
          nextTick(() => stopEiditingAndSetFocus(true, e.rowIndex, colKey));
          break;
        }
      }
    }
  }
}

function startEditingCell(e: any, colKey: string) {
  if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
    columnDefs.find(column => column.field === colKey)!.editable = true;
    gridApi.value!.setGridOption("columnDefs",columnDefs)
    nextTick(() => gridApi.value!.startEditingCell({
      rowIndex: e.rowIndex,
      colKey: e.column
    }));
  }
}

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  columnDefs.forEach(column => column.editable = false);
  gridApi.value!.setGridOption("columnDefs",columnDefs)
  gridApi.value!.setFocusedCell(rowIndex, colKey);
  gridApi.value!.stopEditing(cancel);
}
</script>

<style scoped>
.searchfield {
  width: 200px;
  height: 20px;
  position: absolute;
  right: 10px;
  top: 5px;
  z-index: 2000;
}

.centeredButton {
  margin: 0;
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}
</style>
