<template>
  <v-autocomplete v-model="searchedPaket" :items="this.pakete" item-title=this.columnApi.getColumns()[0].getColId()
                  item-value="id" label="Paket suchen"
                  style="position: absolute;right:100px;top:150px; width: 200px; z-index:2"
                  @update:modelValue="searchPaket"></v-autocomplete>
  <div style='width: 100%;height: 100%'>
    <ag-grid-vue
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
  <context-menu :providedFunctionsProp="[...this.providedFunctions]" ref="contextMenu"></context-menu>
</template>
<!--
<script setup lang="ts">
import { provide, ref } from "vue";
import ContextMenu from "@/components/ContextMenu.vue";

const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

function rightClickOnCell(e) {
  contextMenuRef.value!.showMenu(e);
  if (gridApi.value!.getFocusedCell()) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    gridApi.value!.getRowNode(focusedRowIndex + "")!.setSelected(true);
  }
}
provide("addNewPaket": addNewPaket),
  addNewKindPaket: this.addNewKindPaket,
  deletePaket: this.deletePaket,
  comparePaket: this.comparePaket,
  movePaketUp: this.movePaketUp,
  movePaketDown: this.movePaketDown,
  movePaketRightUp: this.movePaketRightUp,
  movePaketRightDown: this.movePaketRightDown,
  movePaketLeftUp: this.movePaketLeftUp,
  movePaketLeftDown: this.movePaketLeftDown,
</script>-->
<script>
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {AgGridVue} from 'ag-grid-vue3';
import TreeDataCellRenderer from '@/components/TreeDataCellRenderer.vue';

import {usePaketeStore} from '@/stores/pakete';
import {nextTick} from 'vue';
import {useBucketsStore} from "@/stores/buckets";
import {useRouter} from "vue-router";
import ContextMenu from "@/components/ContextMenu.vue";
import {useProjektStore} from "@/stores/projekt";

export default {
  name: 'PaketUebersichtView',
  data() {
    return {
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        editable: false,
        resizable: true,
        suppressKeyboardEvent: params => {
          let key = params.event.key;
          return (params.event.ctrlKey || params.event.shiftKey) && ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Delete', 'Enter', 'F2'].includes(key) || ['Delete', 'Enter', 'F2', 'Escape'].includes(key) /*|| this.suppressedKeysArray.includes(key)*/;
        }
      },
      columnDefs: [
        {
          field: 'thema',
          headerName: 'Thema',
          width: 300,
          cellRenderer: TreeDataCellRenderer
        },
        {
          field: 'lvl',
          headerName: 'LVL'
        },
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR'
        },
        {
          field: 'beschreibung',
          headerName: 'Beschreibung'
        },
        {
          field: 'komponente',
          headerName: 'Komponente'
        },
        {
          field: 'bucket',
          headerName: 'Bucket',
          valueSetter: (params) => {
            params.data.bucket = useBucketsStore().buckets.find(bucket => bucket.name === params.newValue);
          },
          valueGetter: (params) => {
            if (params.data.bucket) return params.data.bucket.name
            else return ""
          },
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ["", ...useBucketsStore().getBucketNames()]
          },
          cellStyle: params => {
            if (params.data.children.length > 0) return {backgroundColor: 'lightgrey'}
            else return {backgroundColor: 'transparent'}
          },
          hide: !this.projektStore.bucketmodus
        },
        {
          field: 'schaetzung',
          headerName: 'Schätzung',
          valueSetter: params => {
            if (isNaN(params.newValue)) params.data.schaetzung = null
            else params.data.schaetzung = Number(params.newValue)
          },
          cellStyle: params => {
            if (params.data.children.length > 0) return {backgroundColor: 'lightgrey'}
            else return {backgroundColor: 'transparent'}
          }
        },
        {
          field: 'id',
          headerName: 'ID'
        }
      ],
      searchedPaket: null,
      providedFunctions: [
        {functionName: 'addNewPaket', functionLabel: "Neues Arbeitspaket anlegen"},
        {functionName: 'addNewKindPaket', functionLabel: "Neues Arbeitspaket als Kind anlegen"},
        {functionName: 'deletePaket', functionLabel: "Paket löschen"},
        {functionName: 'comparePaket', functionLabel: "Paket vergleichen"},
        {functionName: 'movePaketUp', functionLabel: "Pfeil hoch", icon: "mdi-arrow-up"},
        {functionName: 'movePaketDown', functionLabel: "Pfeil runter", icon: "mdi-arrow-down"},
        {functionName: 'movePaketRightUp', functionLabel: "Pfeil hoch rechts"},
        {functionName: 'movePaketRightDown', functionLabel: "Pfeil runter rechts"},
        {functionName: 'movePaketLeftDown', functionLabel: "Pfeil runter links"},
        {functionName: 'movePaketLeftUp', functionLabel: "Pfeil hoch links"},
      ],
    };
  },
  setup() {
    //TODO EventListener zum Einfügen neuer Elemente auf der Seite einfügen
    let getRowId = (params) => params.data._id;
    const paketeStore = usePaketeStore();
    const bucketStore = useBucketsStore();
    const projektStore = useProjektStore()
    const router = useRouter();
    const rowData = paketeStore.paketeAsTreeView;
    const printableChar = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!"£$%^&amp;*()_+-=[];\\\'#,. /\\|<>?:@~{}'
    const suppressedKeysArray = [];
    for (let char of printableChar)
      suppressedKeysArray.push(char)
    return {rowData, paketeStore, bucketStore, projektStore, getRowId, router, suppressedKeysArray};
  },
  components: {
    ContextMenu,
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TreeDataCellRenderer
  },
  computed: {
    pakete() {
      return this.paketeStore.paketeAsFlatView();
    }
  },
  provide() {
    return {
      addNewPaket: this.addNewPaket,
      addNewKindPaket: this.addNewKindPaket,
      deletePaket: this.deletePaket,
      comparePaket: this.comparePaket,
      movePaketUp: this.movePaketUp,
      movePaketDown: this.movePaketDown,
      movePaketRightUp: this.movePaketRightUp,
      movePaketRightDown: this.movePaketRightDown,
      movePaketLeftUp: this.movePaketLeftUp,
      movePaketLeftDown: this.movePaketLeftDown,
    }
  },
  methods: {
    /*    onFirstDataRendered(params) {
          params.api.sizeColumnsToFit();
          params.columnApi.autoSizeColumns()
        },*/
    //TODO Das sollte in die contextMenü Komponente wandern
    rightClickOnCell(e) {
      this.$refs.contextMenu.showMenu(e);
      if (this.gridApi.getFocusedCell()) {
        const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
        const selectedPaket = this.rowData[focusedRowIndex];
        this.gridApi.getRowNode(selectedPaket.id).setSelected(true);
      }
    },
    searchPaket() {
      const searchedPaket = this.paketeStore.paketeAsMap.get(this.searchedPaket);
      let parent = searchedPaket.parent;
      while (parent) {
        if (!parent.open) {
          parent.open = true;
          this.paketeStore.updateTreeViewAfterChangedOpenState(parent);
          break;
        }
        parent = parent.parent;
      }
      this.refreshTable(this.gridApi.getFocusedCell() ? this.gridApi.getFocusedCell().column : this.columnApi.getColumns()[0].getColId(), this.searchedPaket)
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellClicked(e) {
      //TODO Wenn editiert wird, klick aus dem edit dialog soll richtig behandelt werden
      /*if(this.gridApi.getEditingCells()[0]) console.log("editing" + this.gridApi.getEditingCells()[0].rowIndex)
      console.log("event" + e.rowIndex)
      if(this.gridApi.getEditingCells().length!==0 && this.gridApi.getEditingCells()[0].rowIndex!==e.rowIndex) {
        console.log("onCellClicked")
        this.stopEiditingAndSetFocus(true,e.rowIndex,e.column.colId)
      }*/
      this.searchedPaket = null;
      this.columnDefs.forEach(column => column.editable = false)
    },
    onCellDoubleClicked(e) {
      if (this.gridApi.getEditingCells().length === 0) {
        this.startEditingCell(e, e.column.colId)
      }
    },
    onCellValueChanged(params) {
      if (params.column.colId === 'schaetzung' && params.oldValue !== params.newValue)
        this.paketeStore.updateSchaetzung(params.data, params.newValue - params.oldValue);

      /*if (params.column.colId === 'thema') {
        const currentPaketId = params.data.id
        let sameThemaPaketId = -1;
        let valid = true;
        for (const paket of this.rowData) {
          if (paket.id !== currentPaketId && paket.thema)
            if (paket.id !== currentPaketId && paket.thema === params.newValue) {
              valid = false;
              sameThemaPaketId = paket.id
              break;
            }
        }
        if (!valid) {
          this.columnDefs.find(column => column.field === 'thema').cellStyle = params => {
            if (params.data.id === currentPaketId || params.data.id === sameThemaPaketId)
              return {backgroundColor: 'red'};
          }
        }

      }*/
    },
    addNewPaket() {
      let newPaketID = 0;
      if (this.gridApi.getSelectedRows()[0]) {
        newPaketID = this.paketeStore.addNew(this.gridApi.getSelectedRows()[0].id)
        this.refreshTable(this.gridApi.getFocusedCell().column, newPaketID);
      } else {
        newPaketID = this.paketeStore.addNew(-1)
        this.refreshTable(this.columnApi.getColumns()[0].getColId(), newPaketID);
      }

    },
    addNewKindPaket() {
      if (this.gridApi.getSelectedRows()[0]) {
        const newPaketID = this.paketeStore.addNewChild(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable(this.gridApi.getFocusedCell().column, newPaketID);
      }
    },
    deletePaket() {
      if (this.gridApi.getSelectedRows()[0]) {
        const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
        this.paketeStore.deletePaket(this.gridApi.getSelectedRows()[0].id);
        if (this.rowData[focusedRowIndex]) this.refreshTable(this.columnApi.getColumns()[0].getColId(), this.rowData[focusedRowIndex].id)
        else if (this.rowData.length !== 0) {
          this.refreshTable(this.columnApi.getColumns()[0].getColId(), this.rowData[this.rowData.length - 1].id);
        } else {
          this.refreshTable(this.columnApi.getColumns()[0].getColId(), null)
        }
      }
    },
    comparePaket() {
      if (this.gridApi.getSelectedRows()[0] && this.gridApi.getSelectedRows()[0].children.length === 0) {
        const currentPaket = this.gridApi.getSelectedRows()[0];
        currentPaket.bucket = null;
        this.router.push({name: 'vergleich'});
      }
    },
    movePaketUp() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id;
        this.paketeStore.moveUp(paketID);
        this.refreshTable(this.gridApi.getFocusedCell().column, paketID);
      }
    },
    movePaketDown() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id;
        this.paketeStore.moveDown(paketID);
        this.refreshTable(this.gridApi.getFocusedCell().column, paketID);
      }
    },
    movePaketLeftUp() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id;
        this.paketeStore.moveLeftUp(paketID);
        this.refreshTable(this.gridApi.getFocusedCell().column, paketID);
      }
    },
    movePaketLeftDown() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id;
        this.paketeStore.moveLeftDown(paketID);
        this.refreshTable(this.gridApi.getFocusedCell().column, paketID);
      }
    },
    movePaketRightDown() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id;
        this.paketeStore.moveRightDown(paketID);
        this.refreshTable(this.gridApi.getFocusedCell().column, paketID);
      }
    },
    movePaketRightUp() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id;
        this.paketeStore.moveRightUp(paketID);
        this.refreshTable(this.gridApi.getFocusedCell().column, paketID);
      }
    },
    /*switchFlatAndTree() {
      const params = {columns: ['ticket_nr']};
      const instances = this.gridApi.getCellRendererInstances(params);
      instances.forEach((instance) => {
        instance.switchFlatAndTree();
      });
    },*/
    // getRowNode => echte Paket ID
    // setFocusedCell => rowIndex von rowData und colKey
    refreshTable(colKey, paketId) {
      nextTick(() => {
        this.gridApi.setRowData(this.paketeStore.paketeAsTreeView)
        this.columnDefs.forEach(column => column.editable = false)
        if (paketId !== null) {
          this.gridApi.getRowNode(paketId).setSelected(true);
          this.gridApi.setFocusedCell(this.gridApi.getRowNode(paketId).rowIndex, colKey);
        } else {
          this.gridApi.setFocusedCell(null)
        }
        this.gridApi.refreshCells({force: true});
      });
    },
    onCellKeyPress(e) {
      if (e.event) {
        const key = e.event.key
        const ctrl = e.event.ctrlKey;
        const shift = e.event.shiftKey;
        const alt = e.event.altKey;
        const colKey = e.column.colId;
        if (this.gridApi.getEditingCells().length === 0) {
          switch (key) {
            case 'ArrowUp':
              if (ctrl || shift) {
                this.movePaketUp();
              } else {
                const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
                const selectedPaket = this.rowData[focusedRowIndex];
                if (selectedPaket) {
                  this.gridApi.getRowNode(selectedPaket.id).setSelected(true)
                }
              }
              break;
            case 'ArrowDown':
              if (ctrl || shift) {
                this.movePaketDown();
              } else {
                const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
                const selectedPaket = this.rowData[focusedRowIndex];
                if (selectedPaket) {
                  this.gridApi.getRowNode(selectedPaket.id).setSelected(true)
                }
              }
              break;
            case 'ArrowLeft':
              if (ctrl) this.movePaketLeftDown();
              else if (shift) this.movePaketLeftUp();
              break;
            case 'ArrowRight':
              if (ctrl) this.movePaketRightDown();
              else if (shift) this.movePaketRightUp();
              break;
            case '_':
            case '-':
              if (!ctrl) this.deletePaket();
              break;
            case 'Delete':
              if (shift || ctrl) {
                this.deletePaket();
              } else {
                if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
                  if (colKey === 'schaetzung') {
                    this.paketeStore.updateSchaetzung(e.data, -e.value)
                    e.data[colKey] = null
                  } else e.data[colKey] = null
                  this.refreshTable(colKey, e.data.id)
                }
              }
              break;
            case '+':
              if (!ctrl && !shift)
                this.addNewPaket()
              else if (shift) {
                this.addNewKindPaket()
              }
              break;
            case '*': {
              if (!ctrl)
                this.addNewKindPaket();
              break
            }
            case ' ':
              if (ctrl) {
                //TODO TreeDataCellRenderer macht beim +-Button die gleiche Logik => eine gemeinsame Funktion nutzen
                if (e.data.children.length > 0) {
                  const aktuellesPaket = e.data;
                  aktuellesPaket.open = !aktuellesPaket.open;
                  e.node.setData(aktuellesPaket);
                  this.paketeStore.updateTreeViewAfterChangedOpenState(aktuellesPaket);
                  this.refreshTable(colKey, e.data.id)
                }
              }
              break;
            case 'F2':
              this.startEditingCell(e, colKey)
              break;

          }
        } else {
          switch (key) {
            case 'Enter':
              this.stopEiditingAndSetFocus(false, e.rowIndex, colKey)
              break;
            case 'Escape':
              this.stopEiditingAndSetFocus(true, e.rowIndex, colKey)

              break;
          }
        }
      }
    },
    stopEiditingAndSetFocus(cancel, rowIndex, colKey) {
      this.gridApi.stopEditing(cancel)
      this.columnDefs.forEach(column => column.editable = false)
      this.gridApi.setFocusedCell(rowIndex, colKey);
    },
    startEditingCell(e, colKey) {
      if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
        this.columnDefs.find(column => column.field === colKey).editable = true
        nextTick(() => this.gridApi.startEditingCell({
          rowIndex: e.rowIndex,
          colKey: e.column
        }))
      }
    }
  }
};
</script>