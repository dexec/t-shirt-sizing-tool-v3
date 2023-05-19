<template>
  <v-autocomplete label="Paket suchen" v-model="searchedPaket" :items="this.paketeChildren"
                  item-title="ticket_nr" item-value="id" style="position: absolute;right:100px;top:150px; width: 200px; z-index:2"
                  @update:modelValue="searchPaket"></v-autocomplete>
  <div style='width: 100%;height: 100%'>
    <ag-grid-vue
        :columnDefs='columnDefs'
        :defaultColDef='defaultColDef'
        :getRowId='getRowId'
        :rowData='rowData'
        class='ag-theme-alpine'
        rowSelection='single'
        style='width: 100%;height: 100%'
        @cellValueChanged="onCellValueChanged"
        @contextmenu="rightClickOnCell"
        @cell-key-down="onCellKeyPress"
        @cell-clicked="onCellClicked"
        @grid-ready='onGridReady'>
    </ag-grid-vue>
  </div>
  <context-menu :providedFunctionsProp="[...this.providedFunctions]"></context-menu>
</template>
<!--<script setup>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";
import { ref } from 'vue'
import TreeDataCellRenderer from '@/components/TreeDataCellRenderer.vue'

const selectedRow = ref(null)
const gridApi = ref(null)
const columnApi = ref(null)
const defaultColDef = ref({
  editable: true
})
const columnDefs = ref([
  {
    field: 'ticket_nr',
    headerName: 'Ticket-NR',
    minWidth: 5,
    cellRenderer: TreeDataCellRenderer
  },
  {
    field: 'thema',
    headerName: 'Thema'
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
    editable: false
  },
  {
    field: 'schaetzung',
    headerName: 'Schätzung'
  }
])

function onGridReady(params) {
  this.gridApi = params.api
  this.columnApi = params.columnApi
  //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
}

function onCellClicked(params) {
  this.selectedRow = params.data
}

function addNewPaket() {
  //store.addNew(this.selectedRow)
}

function removeItem() {
  if (typeof this.selectedRow !== 'undefined') {
    //store.deletePaket(this.selectedRow.id)
  }
}
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
import {useVergleicheStore} from "@/stores/vergleiche";
import ContextMenu from "@/components/ContextMenu.vue";

export default {
  name: 'PaketUebersichtView',
  data() {
    return {
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        editable: true,
        resizable:true,
        suppressKeyboardEvent: params => {
          let key = params.event.key;
          return params.event.ctrlKey && (key === 'ArrowDown' || key === 'ArrowUp' || key === 'ArrowRight' || key === 'ArrowLeft' || key === 'Delete');
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
          headerName: 'LVL',
          editable: false
        },
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
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
            values: [...useBucketsStore().getBucketNames()]
          },
          editable: params => params.data.children.length === 0
        },
        {
          field: 'schaetzung',
          headerName: 'Schätzung',
          editable: params => params.data.children.length === 0,
          valueSetter: params => {
            if (isNaN(params.newValue)) params.data.schaetzung = Number(0)
            else params.data.schaetzung = Number(params.newValue)
          }
        },
        {
          field: 'id',
          headerName: 'ID',
          editable: false
        }
      ],
      searchedPaket: null,
      providedFunctions: [
        {functionName: 'addNewPaket', functionLabel: "Neues Arbeitspaket anlegen"},
        {functionName: 'addNewKindPaket', functionLabel: "Neues Arbeitspaket als Kind anlegen"},
        {functionName: 'deletePaket', functionLabel: "Paket löschen"},
        {functionName: 'comparePaket', functionLabel: "Paket vergleichen"},
        {functionName: 'movePaketUp', functionLabel: "Pfeil hoch"},
        {functionName: 'movePaketDown', functionLabel: "Pfeil runter"},
        {functionName: 'movePaketRightUp', functionLabel: "Pfeil hoch rechts"},
        {functionName: 'movePaketRightDown', functionLabel: "Pfeil runter rechts"},
        {functionName: 'movePaketLeftDown', functionLabel: "Pfeil runter links"},
        {functionName: 'movePaketLeftUp', functionLabel: "Pfeil hoch links"},
      ]
    };
  },
  setup() {
    //TODO EventListener zum Einfügen neuer Elemente auf der Seite einfügen
    let getRowId = (params) => params.data._id;
    const paketeStore = usePaketeStore();
    const bucketStore = useBucketsStore();
    const vergleicheStore = useVergleicheStore();
    const router = useRouter();
    const rowData = paketeStore.paketeAsTreeView;
    return {rowData, paketeStore, bucketStore, vergleicheStore, getRowId, router};
  },
  components: {
    ContextMenu,
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TreeDataCellRenderer
  },
  computed: {
    paketeChildren() {
      return this.paketeStore.paketeChildren();
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
    showMenu(e) {
      e.preventDefault();
      const contextMenu = document.querySelector(".wrapper")
      let x = e.clientX
      let y = e.clientY
      contextMenu.style.left = `${x}px`;
      contextMenu.style.top = `${y}px`;
      contextMenu.style.display = "block";
      //TODO Beim Klick soll der Fokus zurück auf Tabelle gehen
      document.addEventListener("click", () => contextMenu.style.display = "none");
    },
    rightClickOnCell(e) {
      this.showMenu(e)
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
      this.refreshTable(this.gridApi.getFocusedCell() ? this.gridApi.getFocusedCell().column : "ticket_nr", this.searchedPaket)
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellClicked() {
      this.searchedPaket = null;
    },
    onCellValueChanged(params) {
      if (params.column.colId === 'bucket' && params.data.id === this.vergleicheStore.currentSelectedPaket.id && !params.oldValue) this.vergleicheStore.currentSelectedPaket = this.paketeStore.paketeChildrenWithNoBucket()[0];
      if (params.column.colId === 'schaetzung' && params.oldValue !== params.newValue) this.paketeStore.updateSchaetzung(params.data, params.newValue - params.oldValue);
      this.refreshTable(params.column.colId, params.data.id);
    },
    addNewPaket() {
      let newPaketID = 0;
      if (this.gridApi.getSelectedRows()[0]) {
        newPaketID = this.paketeStore.addNew(this.gridApi.getSelectedRows()[0].id)
      } else {
        newPaketID = this.paketeStore.addNew(-1)
      }
      this.refreshTable("ticket_nr", newPaketID);
    },
    addNewKindPaket() {
      if (this.gridApi.getSelectedRows()[0]) {
        const newPaketID = this.paketeStore.addNewChild(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable("ticket_nr", newPaketID)
      }
    },
    deletePaket() {
      if (this.gridApi.getSelectedRows()[0]) {
        const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
        this.paketeStore.deletePaket(this.gridApi.getSelectedRows()[0].id);
        if (this.rowData[focusedRowIndex]) this.refreshTable("ticket_nr", this.rowData[focusedRowIndex].id)
        else if (this.rowData.length !== 0) {
          this.refreshTable("ticket_nr", this.rowData[this.rowData.length - 1].id);
        } else {
          this.refreshTable("ticket_nr", null)
        }
      }
    },
    comparePaket() {
      if (this.gridApi.getSelectedRows()[0] && this.gridApi.getSelectedRows()[0].children.length === 0) {
        const currentPaket = this.gridApi.getSelectedRows()[0];
        currentPaket.bucket = null;
        this.vergleicheStore.currentSelectedPaket = currentPaket;
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
        let key = e.event.key
        let ctrl = e.event.ctrlKey;
        let shift = e.event.shiftKey;
        let alt = e.event.altKey;
        if (this.gridApi.getEditingCells().length === 0)
          switch (key) {
            case 'ArrowUp':
              if (ctrl) {
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
              if (ctrl) {
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
              if (ctrl) {
                if (shift) this.movePaketLeftUp();
                else this.movePaketLeftDown();
              }
              break;
            case 'ArrowRight':
              if (ctrl) {
                if (shift) this.movePaketRightUp();
                else this.movePaketRightDown();
              }
              break;
            case 'Delete':
              if (ctrl) this.deletePaket();
              break;
            case ' ' :
              if (ctrl) {
                if (e.data.children.length > 0) {
                  const params = {columns: ['thema'], rowNodes: [e.node]}
                  this.gridApi.getCellRendererInstances(params)[0].changeOpenState();
                }
              }
              break;
            case 'a' :
              if (ctrl) {
                this.addNewPaket();
              }
              break;
            case 'A':
              if (ctrl) this.addNewKindPaket()
          }
      }
    }
  }
};
</script>