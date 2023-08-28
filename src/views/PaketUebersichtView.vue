<template>

  <div style='width: 100%;height: 100%'>
    <ag-grid-vue
        :cacheQuickFilter="true"
        :columnDefs='columnDefs'
        :defaultColDef='defaultColDef'
        :getRowId='getRowId'
        :rowData='rowData'
        :stopEditingWhenCellsLoseFocus="false"
        class='ag-theme-alpine'
        rowSelection='single'
        style='width: 100%;height: 100%'
        @cellValueChanged="onCellValueChanged"
        @contextmenu="rightClickOnCell"
        @cell-key-down="onCellKeyPress"
        @cell-clicked="onCellClicked"
        @cell-double-clicked="onCellDoubleClicked"
        @grid-ready='onGridReady'>
    </ag-grid-vue>
  </div>
  <context-menu ref="contextMenuRef" :providedFunctionsProp="[...providedFunctions]"></context-menu>
</template>
<script lang="ts" setup>
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {AgGridVue} from 'ag-grid-vue3';
import TreeDataCellRenderer from '@/components/TreeDataCellRenderer.vue';

import {usePaketeStore} from '@/stores/pakete';
import {nextTick, provide, reactive, ref, watch} from 'vue';
import {useBucketsStore} from "@/stores/buckets";
import {useRouter} from "vue-router";
import ContextMenu from "@/components/ContextMenu.vue";
import {useProjektStore} from "@/stores/projekt";
import {Column, ColumnApi, GridApi} from "ag-grid-community";
import type {Bucket} from "@/Bucket";
import {useVariablenAustauschStore} from "@/stores/variablenAustausch";
import type {Paket} from "@/Paket";

const gridApi = ref<GridApi>();
let getRowId = (params: any): number => params.data._id;
const paketeStore = usePaketeStore();
const rowData = paketeStore.paketeAsTreeView;

function onGridReady(params: any) {
  columnApi.value = params.columnApi;
  gridApi.value = params.api;
}

const columnApi = ref<ColumnApi>();

const defaultColDef = reactive({
  resizable: true, filter: 'agTextColumnFilter',
  suppressKeyboardEvent: (params: any) => {
    let key = params.event.key;
    return (params.event.ctrlKey || params.event.shiftKey) && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'F2'].includes(key) || ['Delete', 'Enter', 'F2', 'Escape'].includes(key) /*|| suppressedKeysArray.includes(key)*/;
  }
})
const columnDefs = ref([
  {
    field: 'ticket_nr',
    headerName: 'Ticket-NR',
    cellRenderer: TreeDataCellRenderer,
    editable: false
  },
  {
    field: 'thema',
    headerName: 'Thema',
    width: 300,

    editable: false
  },
  {
    field: 'lvl',
    headerName: 'LVL',
    editable: false
  },
  {
    field: 'beschreibung',
    headerName: 'Beschreibung',
    editable: false
  },
  {
    field: 'komponente',
    headerName: 'Komponente',
    editable: false
  },
  {
    field: 'bucket',
    headerName: 'Bucket',
    valueSetter: (params: any) => {
      if (params.newValue === "") usePaketeStore().updateBucket(params.data, null);
      else {
        const bucket = useBucketsStore().bucketsAsSortedArray.find(bucket => bucket.name === params.newValue) as Bucket;
        usePaketeStore().updateBucket(params.data, bucket);
      }
    },
    valueGetter: (params: any) => {
      if (params.data.bucket) return params.data.bucket.name
      else return ""
    },
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: {
      values: ["", ...useBucketsStore().getBucketNamesSorted()]
    },
    cellStyle: (params: any): any => {
      if (params.data.children.length > 0) return {backgroundColor: 'lightgrey'}
      else return {backgroundColor: 'transparent'}
    },
    hide: !useProjektStore().bucketmodus,
    editable: false
  },
  {
    field: 'schaetzung',
    headerName: 'Schätzung',
    valueSetter:(params:any) => {
      if(isNaN(params.newValue)) params.data.schaetzung = params.oldValue;
      else {
        params.data.schaetzung = Number(params.newValue)
        paketeStore.updateSchaetzung(params.data,params.oldValue)
        gridApi.value!.refreshCells({force: true});
      }
    },
    cellStyle: (params: any): any => {
      if (params.data.children.length > 0) return {backgroundColor: 'lightgrey'}
      else return {backgroundColor: 'transparent'}
    },
    filter: 'agNumberColumnFilter',
    editable: false
  },
  {
    field: 'id',
    headerName: 'ID',
    editable: false
  }
])
const variablenAustauschStore = useVariablenAustauschStore();
//TODO Die Suche so umsetzen, dass das gesuchte Ziel mit seinen Elternelementen steht
watch(() => variablenAustauschStore.searchPaketString, (newValue) => {
  gridApi.value!.setQuickFilter(newValue);
  for (let paket of paketeStore.paketeAsMap.values()) {
    const paketStringIndexed: { [index: string]: any } = paket
    /*for (const key in paketStringIndexed) {
      if (typeof paketStringIndexed[key] === "string" && gridApi.value!.getQuickFilter() != "" && paketStringIndexed[key].includes(gridApi.value!.getQuickFilter())) {
        if(!paketeStore.paketeAsTreeView.includes(paket))
        paketeStore.showPaket(paket as Paket)
      }
    }*/
  }
  refreshTable();
});
provide("addNewPaket", addNewPaket);
provide("addNewKindPaket", addNewKindPaket);
provide("deletePaket", deletePaket);
provide("comparePaket", comparePaket);
provide("movePaketUp", movePaketUp);
provide("movePaketDown", movePaketDown);
provide("movePaketRightUp", movePaketRightUp);
provide("movePaketRightDown", movePaketRightDown);
provide("movePaketLeftDown", movePaketLeftDown);
provide("movePaketLeftUp", movePaketLeftUp);
const providedFunctions = ref([
  {functionName: 'addNewPaket', functionLabel: "Neues Arbeitspaket anlegen"},
  {functionName: 'addNewKindPaket', functionLabel: "Neues Arbeitspaket als Kind anlegen"},
  {functionName: 'deletePaket', functionLabel: "Paket löschen"},
  {functionName: 'comparePaket', functionLabel: "Paket vergleichen"},
  {functionName: 'movePaketUp', functionLabel: "Pfeil hoch", icon: "mdi-arrow-up"},
  {functionName: 'movePaketDown', functionLabel: "Pfeil runter", icon: "mdi-arrow-down"},
  {functionName: 'movePaketRightUp', functionLabel: "Pfeil hoch rechts", icon: "mdi-arrow-top-right"},
  {functionName: 'movePaketRightDown', functionLabel: "Pfeil runter rechts", icon: "mdi-arrow-bottom-right"},
  {functionName: 'movePaketLeftDown', functionLabel: "Pfeil runter links", icon: "mdi-arrow-bottom-left"},
  {functionName: 'movePaketLeftUp', functionLabel: "Pfeil hoch links", icon: "mdi-arrow-left-up"},
])
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

function rightClickOnCell(e: any) {
  contextMenuRef.value!.showMenu(e);
  if (gridApi.value!.getFocusedCell()!) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    gridApi.value!.getDisplayedRowAtIndex(focusedRowIndex)!.setSelected(true);
  }
}

function onCellClicked() {
  //TODO Wenn editiert wird, klick aus dem edit dialog soll richtig behandelt werden
  /*if(gridApi.value!.getEditingCells()[0]) console.log("editing" + gridApi.value!.getEditingCells()[0].rowIndex)
  console.log("event" + e.rowIndex)
  if(gridApi.value!.getEditingCells().length!==0 && gridApi.value!.getEditingCells()[0].rowIndex!==e.rowIndex) {
    console.log("onCellClicked")
    stopEiditingAndSetFocus(true,e.rowIndex,e.column.colId)
  }*/
  columnDefs.value.forEach(column => column.editable = false)
}

function onCellDoubleClicked(e: any) {
  if (gridApi.value!.getEditingCells().length === 0) {
    startEditingCell(e, e.column.colId)
  }
}

function onCellValueChanged(params: any) {

}

function addNewPaket() {
  let newPaketID = 0;
  if (gridApi.value!.getSelectedRows()[0]) {
    newPaketID = paketeStore.addNew(gridApi.value!.getSelectedRows()[0].id)
    refreshTable(gridApi.value!.getFocusedCell()!.column, newPaketID);
  } else {
    newPaketID = paketeStore.addNew(-1)
    refreshTable(columnApi.value!.getColumns()![0].getColId(), newPaketID);
  }
}

function addNewKindPaket() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const newPaketID = paketeStore.addNewChild(gridApi.value!.getSelectedRows()[0].id);
    refreshTable(gridApi.value!.getFocusedCell()!.column, newPaketID);
  }
}

//TODO Bugfix, wenn ich man zu schnell löscht, kommt irgendwas nicht hinterher
function deletePaket() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    const focusedColumn = gridApi.value!.getFocusedCell()?.column!;
    paketeStore.deletePaket(gridApi.value!.getSelectedRows()[0].id);
    if (rowData[focusedRowIndex]) refreshTable(focusedColumn, rowData[focusedRowIndex].id)
    else if (rowData.length !== 0) {
      refreshTable(focusedColumn, rowData[rowData.length - 1].id);
    } else {
      refreshTable(focusedColumn.getColId())
    }
  }
}

function comparePaket() {
  if (gridApi.value!.getSelectedRows()[0] && gridApi.value!.getSelectedRows()[0].children.length === 0) {
    const router = useRouter();
    const currentPaket = gridApi.value!.getSelectedRows()[0];
    currentPaket.bucket = null;
    router.push({name: 'vergleich'});
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

//TODO Da werden Pakete irgendwie gelöscht zwischendurch, wenn man auf der Ebene max-1 Pakete verschiebt
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
    gridApi.value!.setRowData(paketeStore.paketeAsTreeView)
    columnDefs.value.forEach(column => column.editable = false)
    if (paketId != undefined && colKey != undefined) {
      gridApi.value!.getRowNode(paketId + "")!.setSelected(true);
      gridApi.value!.setFocusedCell(gridApi.value!.getRowNode(paketId + "")!.rowIndex as number, colKey);
    }
    gridApi.value!.refreshCells({force: true});
  });
}

function onCellKeyPress(e: any) {
  if (e.event) {
    const key = e.event.key
    const ctrl = e.event.ctrlKey;
    const shift = e.event.shiftKey;
    const alt = e.event.altKey;
    const colKey = e.column.colId;
    if (gridApi.value!.getEditingCells().length === 0) {
      switch (key) {
        case 'ArrowUp':
          if (ctrl || shift) {
            movePaketUp();
          } else {
            const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
            const selectedPaket = rowData[focusedRowIndex];
            if (selectedPaket) {
              gridApi.value!.getRowNode(selectedPaket.id + "")!.setSelected(true)
            }
          }
          break;
        case 'ArrowDown':
          if (ctrl || shift) {
            movePaketDown();
          } else {
            const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
            const selectedPaket = rowData[focusedRowIndex];
            if (selectedPaket) {
              gridApi.value!.getRowNode(selectedPaket.id + "")!.setSelected(true)
            }
          }
          break;
        case 'ArrowLeft':
          if (ctrl) movePaketLeftDown();
          else if (shift) movePaketLeftUp();
          break;
        case 'ArrowRight':
          if (ctrl) movePaketRightDown();
          else if (shift) movePaketRightUp();
          break;
        case '_':
        case '-':
          if (!ctrl) deletePaket();
          break;
        case 'Delete':
          if (shift || ctrl) {
            deletePaket();
          } else {
            if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
              if (colKey === 'schaetzung') {
                const oldValue = e.data.schaetzung;
                e.data.schaetzung=null
                paketeStore.updateSchaetzung(e.data, oldValue)
              } else if (colKey === 'bucket') {
                usePaketeStore().updateBucket(e.data, null)
              } else e.data[colKey] = null
              refreshTable(colKey, e.data.id)
            }
          }
          break;
        case '+':
          if (!ctrl && !shift)
            addNewPaket()
          else if (shift) {
            addNewKindPaket()
          }
          break;
        case '*': {
          if (!ctrl)
            addNewKindPaket();
          break
        }
        case ' ':
          if (ctrl) {
            //TODO TreeDataCellRenderer macht beim +-Button die gleiche Logik => eine gemeinsame Funktion nutzen
            if (e.data.children.length > 0) {
              const aktuellesPaket = e.data;
              aktuellesPaket.open = !aktuellesPaket.open;
              e.node.setData(aktuellesPaket);
              paketeStore.updateTreeViewAfterChangedOpenState(aktuellesPaket);
              refreshTable(colKey, e.data.id)
            }
          }
          break;
        case 'F2':
          startEditingCell(e, colKey)
          break;

      }
    } else {
      switch (key) {
        case 'Enter':
          stopEiditingAndSetFocus(false, e.rowIndex, colKey)
          break;
        case 'Escape':
          stopEiditingAndSetFocus(true, e.rowIndex, colKey)

          break;
      }
    }
  }
}

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  gridApi.value!.stopEditing(cancel)
  columnDefs.value!.forEach(column => column.editable = false)
  gridApi.value!.setFocusedCell(rowIndex, colKey);
}

function startEditingCell(e: any, colKey: string) {
  if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
    columnDefs.value!.find(column => column.field === colKey)!.editable = true
    nextTick(() => gridApi.value!.startEditingCell({
      rowIndex: e.rowIndex,
      colKey: e.column
    }))
  }
}

</script>