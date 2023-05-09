<template>
  <div style='width: 100%;height: 100%'>
    <ag-grid-vue
        :columnDefs='columnDefs'
        :defaultColDef='defaultColDef'
        :getRowId='getRowId'
        :rowData='rowData'
        class='ag-theme-alpine'
        rowSelection='single'
        style='width: 100%;height: 100%'
        suppressRowHoverHighlight='true'
        @cellValueChanged="onCellValueChanged"
        @contextmenu="rightClickOnCell"
        @cell-key-down="onCellKeyDown"
        @grid-ready='onGridReady'>
    </ag-grid-vue>
  </div>
  <div class="wrapper">
    <div class="content">
      <div class="menu">
        <span class="item" @click="addNewPaket">Neues Arbeitspaket anlegen</span>
        <span class="item" @click="addNewKindPaket">Neues Arbeitspaket als Kind anlegen</span>
        <span class="item" @click="removeItem">Paket löschen</span>
        <span class="item" @click="comparePaket">Bucket zuweisen</span>
        <span class="item" @click="movePaketUp"><v-icon size="x-small">mdi-arrow-up</v-icon></span>
        <span class="item" @click="movePaketDown"><v-icon size="x-small">mdi-arrow-down</v-icon></span>
        <span class="item" @click="movePaketLeftUp"><v-icon size="x-small">mdi-arrow-top-left</v-icon></span>
        <span class="item" @click="movePaketLeftDown"><v-icon size="x-small">mdi-arrow-bottom-left</v-icon></span>
        <span class="item" @click="movePaketUpRight"><v-icon size="x-small">mdi-arrow-top-right</v-icon></span>
        <span class="item" @click="movePaketDownRight"><v-icon size="x-small">mdi-arrow-bottom-right</v-icon></span>
      </div>
    </div>
  </div>
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

export default {
  name: 'PaketUebersichtView',
  data() {
    return {
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        editable: true,
        suppressKeyboardEvent: params => {
          let key = params.event.key;
          return params.event.ctrlKey && (key === 'ArrowDown' || key === 'ArrowUp')
        }
      },
      columnDefs: [
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
          minWidth: 5,
          cellRenderer: TreeDataCellRenderer
        },
        {
          field: 'lvl',
          headerName: 'LVL',
          editable: false
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
          valueSetter: (params) => {
            if (params.newValue === "Zuweisung aufheben") params.data.bucket = null;
            else params.data.bucket = useBucketsStore().buckets.find(bucket => bucket.name === params.newValue);
          },
          valueGetter: (params) => {
            if (params.data.bucket) return params.data.bucket.name
            else return ""
          },
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ["Zuweisung aufheben", ...useBucketsStore().getBucketNames()]
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
      ]
    };
  },
  setup() {
    let getRowId = (params) => params.data._id;
    const paketeStore = usePaketeStore();
    const bucketStore = useBucketsStore();
    const rowData = paketeStore.paketeAsTreeView;
    return {rowData, paketeStore, bucketStore, getRowId};
  },
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TreeDataCellRenderer
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
      const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
      const selectedPaket = this.rowData[focusedRowIndex]
      this.gridApi.getRowNode(selectedPaket.id).setSelected(true)
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellValueChanged(params) {
      if (params.column.colId === 'schaetzung' && params.oldValue !== params.newValue) this.paketeStore.updateSchaetzung(params.data, params.newValue - params.oldValue);
      this.refreshTable();
    },
    addNewPaket() {
      let newPaketID = 0;
      if (this.gridApi.getSelectedRows()[0]) {
        newPaketID = this.paketeStore.addNew(this.gridApi.getSelectedRows()[0].id)
      } else {
        newPaketID = this.paketeStore.addNew(-1)
      }
      this.refreshTable();
      nextTick(() => {
        this.gridApi.getRowNode(newPaketID).setSelected(true);
        this.gridApi.setFocusedCell(newPaketID)
      });
      console.log(this.gridApi.getFocusedCell())
    },
    addNewKindPaket() {
      if (this.gridApi.getSelectedRows()[0]) {
        const newPaketID = this.paketeStore.addNewChild(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
        nextTick(() => {
          this.gridApi.getRowNode(newPaketID).setSelected(true);
        });
      }
    },
    removeItem() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.deletePaket(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
      }
    },
    movePaketUp() {
      if (this.gridApi.getSelectedRows()[0]) {
        let paketID = this.gridApi.getSelectedRows()[0].id
        this.paketeStore.moveUp(paketID);
        this.refreshTable()
      }
    },
    movePaketDown() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveDown(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
      }
    },
    movePaketLeftUp() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveLeftUp(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
      }
    },
    movePaketLeftDown() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveLeftDown(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
      }
    },
    movePaketDownRight() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveDownRight(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
      }
    },
    movePaketUpRight() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveUpRight(this.gridApi.getSelectedRows()[0].id);
        this.refreshTable()
      }
    },
    /*switchFlatAndTree() {
      const params = {columns: ['ticket_nr']};
      const instances = this.gridApi.getCellRendererInstances(params);
      instances.forEach((instance) => {
        instance.switchFlatAndTree();
      });
    },*/
    refreshTable() {
      nextTick(() => {
        this.gridApi.setFocusedCell(this.gridApi.getSelectedRows()[0].id);
        this.gridApi.refreshCells({force: true});
        this.gridApi.setRowData(this.paketeStore.paketeAsTreeView)
      });
    },
    onCellKeyDown(e) {
      if (e.event) {
        let key = e.event.key
        if (e.event.ctrlKey) {
          if (key === 'ArrowDown') {
            this.movePaketDown()
          }
          if (key === 'ArrowUp') {
            this.movePaketUp()
          }
        }
        else if(e.event.key==='ArrowUp' || e.event.key==='ArrowDown') {
          const focusedRowIndex = this.gridApi.getFocusedCell().rowIndex;
          const selectedPaket = this.rowData[focusedRowIndex]
          if(selectedPaket) {
            this.gridApi.getRowNode(selectedPaket.id).setSelected(true)
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
