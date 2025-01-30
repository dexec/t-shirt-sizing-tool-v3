<template>
  <div style="height: 100%;display:flex;flex-direction: row;overflow: hidden; flex-grow: 1 ">
    <ag-grid-vue
        :animateRows="false"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :getRowId="getRowId"
        :rowData="rowData"
        :stopEditingWhenCellsLoseFocus="false"
        :suppressMovableColumns="true"
        :suppressClickEdit="true"
        class="ag-theme-alpine"
        rowSelection="single"
        style="width: 100%;height: 100%"
        @cell-editing-stopped="onCellEditingStopped"
        @cellValueChanged="onCellValueChanged"
        @contextmenu="rightClickOnCell"
        @cell-key-down="onCellKeyPress"
        @cell-double-clicked="onCellDoubleClicked"
        @grid-ready="onGridReady">
    </ag-grid-vue>
  </div>
  <v-btn v-if="rowData.length==0" class="centeredButton" @click="addNewPaket">Neues Paket erstellen</v-btn>
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
import {AgGridVue} from "ag-grid-vue3";
import TreeDataCellRenderer from "@/components/TreeDataCellRenderer.vue";

import {usePaketContainer} from "@/stores/paketContainer";
import {useBucketContainer} from "@/stores/bucketContainer";
import {useKonfigContainer} from "@/stores/konfigContainer";
import {nextTick, onMounted, onUpdated, provide, reactive, ref} from "vue";
import {useToast} from "vue-toastification";
import ContextMenu from "@/components/ContextMenu.vue";
import type {ColDef, GridApi, Column} from "ag-grid-community";
import type {Bucket} from "@/models/Bucket";
import type {Paket} from "@/models/Paket";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {errorToastPaketNrEmpty, errorToastPaketNrNotUnique} from "@/models/Toasts";
import WarningCellRenderer from "@/components/cellRenderers/WarningCellRenderer.vue";
import {useRoute, useRouter} from "vue-router";
import router from "@/router";
document.addEventListener('keydown', (e) => {
  if((e.key ==="ArrowUp" || e.key === "ArrowDown") && e.ctrlKey) {
    e.preventDefault();
  }
})
const toast = useToast();
const konfigContainer = useKonfigContainer();
const gridApi = ref<GridApi>();
function getRowId(params: any): string {
  return params.data._id + ""
}
const paketContainer = usePaketContainer();
const rowData = paketContainer.paketeAsTreeView;
let duplicateTicketNrFound = false;
const routeParamsId = ref("");
onMounted(() => {
  routeParamsId.value = useRoute().params.id as string;
  router.push("/pakete/")
})
onUpdated(() => {
  const routeParamsIdNew = useRoute().params.id as string;
  if(routeParamsIdNew=="") return;
  routeParamsId.value = routeParamsIdNew
  const pathId = Number(routeParamsId.value);
  if(pathId == null || isNaN(pathId)) return;
  const selectedRow = gridApi.value!.getSelectedRows()[0]
  if (selectedRow != null) {
    if(selectedRow.id != pathId) showSearchedPaket(paketContainer.paketeAsMap.get(pathId) as Paket);
  }
  router.push("/pakete/")
})
function onGridReady(params: any) {
  gridApi.value = params.api;
  nextTick(() => gridApi.value!.autoSizeColumns(["ticket_nr"]));
  const pathId = Number(routeParamsId.value);
  if(pathId == null || isNaN(pathId)) return;
  nextTick(() => showSearchedPaket(paketContainer.paketeAsMap.get(pathId) as Paket));

  //TODO Grid soll warten bis resiszed wude

/*  window.addEventListener("resize", function () {
    setTimeout(function () {
      const columns = gridApi.value!.getColumns()
      if(columns) gridApi.value!.autoSizeColumns(columns);
    });
  });*/
}


const editableFlag = ref(false)
const defaultColDef = reactive({
  suppressKeyboardEvent: (params: any) => {
    let key = params.event.key;
    return (params.event.ctrlKey || params.event.shiftKey) && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Delete", "Enter", "F2"].includes(key) || ["Delete", "Enter", "F2", "Escape"].includes(key);
  },
  sortable: false,
  editable: () => {return editableFlag.value}
});
const columnDefs: ColDef[] = [
  {
    field: "ticket_nr",
    headerName: "Ticket-NR",
    valueSetter: (params: any): any => {
      if (params.newValue==null || params.newValue == "") {
        params.data.ticket_nr = params.oldValue;
        errorToastPaketNrEmpty();
      } else {
        duplicateTicketNrFound = false;
        const everyTicketNrArray = Array.from(paketContainer.paketeAsMap.values()).map(paket => paket.ticket_nr);
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
    cellRenderer: TreeDataCellRenderer
  },
  {
    field: "id",
    headerName: "id",
    editable: false
  },
  {
    field: "thema",
    headerName: "Thema",
    flex:1
  },
  {
    field: "beschreibung",
    headerName: "Beschreibung",
    flex:2
  },
  {
    field: "bucket",
    headerName: "Bucket",
    valueSetter: (params: any): any => {
      if (params.newValue === "") paketContainer.updateBucket(params.data, null);
      else {
        const bucket = useBucketContainer().bucketsAsSortedArray.find(bucket => bucket.name === params.newValue) as Bucket;
        paketContainer.updateBucket(params.data, bucket);
      }
      gridApi.value!.refreshCells({force: true})
    },
    valueGetter: (params: any) => {
      if (params.data.bucket) return params.data.bucket.name;
      else return "";
    },
    cellEditor: "agSelectCellEditor",
    cellEditorParams: {
      values: ["", ...useBucketContainer().getBucketNamesSorted()]
    },
    cellStyle: (params: any): any => {
      if (params.data.children.length > 0) return {backgroundColor: "lightgrey"};
      else return {backgroundColor: "transparent"};
    },
    hide: !konfigContainer.bucketmodus,
    editable: (params: any) => {
      return params.data.children.length == 0 && editableFlag.value
    },
    maxWidth: 100
  },
  {
    field: "schaetzung",
    headerName: "Schätzung",
    valueSetter: (params: any): any => {
      const newValue = params.newValue.replace(",", ".");
      if (isNaN(newValue)) params.data.schaetzung = params.oldValue;
      else {
        params.data.schaetzung = Number(newValue);
        paketContainer.berechneSchaetzungen();
        nextTick(() => gridApi.value!.refreshCells({force: true}));
      }
    },
    valueGetter: (params: any) => {
      if (params.data.schaetzung!=null) {
        if (params.data.children.length > 0) {
          return Number(params.data.schaetzung).toLocaleString('de', {
            minimumFractionDigits: konfigContainer.nachkommastellen,
            maximumFractionDigits: konfigContainer.nachkommastellen
          });
        } else {
          return params.data.schaetzung.toLocaleString()
        }
      }
    },
    cellStyle: (params: any): any => {
      if (params.data.children.length > 0) return {backgroundColor: "lightgrey"};
      else return {backgroundColor: "transparent"};
    },
    editable: (params: any) => {
      return params.data.children.length == 0 && editableFlag.value
    },
    maxWidth: 200
  },
  {
    headerName: "",
    field: "warning",
    cellRenderer: WarningCellRenderer,
    maxWidth: 50,
    editable: false
  }
];

function showSearchedPaket(paket: Paket) {
  paketContainer.showPaket(paket);
  gridApi.value!.setGridOption('rowData', paketContainer.paketeAsTreeView);
  const rowNodeIndex = gridApi.value!.getRowNode(paket.id + "")!.rowIndex
  if(rowNodeIndex!=null) gridApi.value!.ensureIndexVisible(rowNodeIndex)
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
  {functionName: "addNewPaket", functionLabel: "Neues Arbeitspaket anlegen"},
  {functionName: "addNewKindPaket", functionLabel: "Neues Arbeitspaket als Kind anlegen"},
  {functionName: "attemptDeletePaket", functionLabel: "Paket löschen"},
  {functionName: "movePaketUp", functionLabel: "Pfeil hoch", icon: "mdi-arrow-up"},
  {functionName: "movePaketDown", functionLabel: "Pfeil runter", icon: "mdi-arrow-down"},
  {functionName: "movePaketRightUp", functionLabel: "Pfeil hoch rechts", icon: "mdi-arrow-top-right"},
  {functionName: "movePaketRightDown", functionLabel: "Pfeil runter rechts", icon: "mdi-arrow-bottom-right"},
  {functionName: "movePaketLeftDown", functionLabel: "Pfeil runter links", icon: "mdi-arrow-bottom-left"},
  {functionName: "movePaketLeftUp", functionLabel: "Pfeil hoch links", icon: "mdi-arrow-top-left"}
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

function onCellDoubleClicked(e: any) {
  if (gridApi.value!.getEditingCells().length === 0) {
    editableFlag.value=true
    startEditingCell(e, e.column.colId);
  }
}

function onCellEditingStopped() {
  editableFlag.value = false;
}
function onCellValueChanged(params: any) {
    //gridApi.value!.autoSizeColumns([params.colDef]);
}

function addNewPaket() {
  let newPaketID;
  if (gridApi.value!.getSelectedRows()[0]) {
    newPaketID = paketContainer.addNew(gridApi.value!.getSelectedRows()[0].id);
    refreshTable(gridApi.value!.getFocusedCell()!.column, newPaketID);
  } else {
    newPaketID = paketContainer.addNew(-1);
    refreshTable(gridApi.value!.getColumns()![0].getColId(), newPaketID);
  }
  nextTick(() => gridApi.value!.autoSizeColumns(["ticket_nr"]));
}

function addNewKindPaket() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const newPaketID = paketContainer.addNewChild(gridApi.value!.getSelectedRows()[0].id);
    refreshTable(gridApi.value!.getFocusedCell()!.column, newPaketID);
    nextTick(() => gridApi.value!.autoSizeColumns(["ticket_nr"]));
  }
}

function deletePaket() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    const focusedColumn = gridApi.value!.getFocusedCell()?.column!;
    paketContainer.deletePaket(gridApi.value!.getSelectedRows()[0].id);
    nextTick(() => {
      if (rowData[focusedRowIndex]) refreshTable(focusedColumn, rowData[focusedRowIndex].id);
      else if (rowData.length !== 0) {
        refreshTable(focusedColumn, rowData[rowData.length - 1].id);
      } else {
        refreshTable(focusedColumn.getColId());
      }
      nextTick(() => gridApi.value!.autoSizeColumns(["ticket_nr"]));
    });
  }
}

function movePaketUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketContainer.moveUp(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketContainer.moveDown(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketLeftUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketContainer.moveLeftUp(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketLeftDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketContainer.moveLeftDown(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketRightDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketContainer.moveRightDown(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function movePaketRightUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    let paketID = gridApi.value!.getSelectedRows()[0].id;
    paketContainer.moveRightUp(paketID);
    refreshTable(gridApi.value!.getFocusedCell()!.column, paketID);
  }
}

function refreshTable(colKey?: Column | string, paketId?: number) {
  nextTick(() => {
    gridApi.value!.setGridOption('rowData', paketContainer.paketeAsTreeView);
    /*columnDefs.forEach(column => column.editable = false);
    gridApi.value!.setGridOption("columnDefs", columnDefs);*/
    if (paketId != undefined && colKey != undefined) {
      gridApi.value!.getRowNode(paketId + "")!.setSelected(true);
      gridApi.value!.setFocusedCell(gridApi.value!.getRowNode(paketId + "")!.rowIndex as number, colKey);
    }
    gridApi.value!.refreshCells({force: true});
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
                nextTick(() => paketContainer.berechneSchaetzungen());
              } else if (colKey === "bucket") {
                nextTick(() => paketContainer.updateBucket(e.data, null));
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
              nextTick(() => paketContainer.updateTreeViewAfterChangedOpenState(aktuellesPaket));
              refreshTable(colKey, e.data.id);
              nextTick(() => gridApi.value!.autoSizeColumns(["ticket_nr"]));
            }
          }
          break;
        case "F2":
          editableFlag.value = true;
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
  if ((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0 || colKey === "warning") return;
  nextTick(() => gridApi.value!.startEditingCell({
    rowIndex: e.rowIndex,
    colKey: e.column
  }));
}

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  editableFlag.value=false;
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
