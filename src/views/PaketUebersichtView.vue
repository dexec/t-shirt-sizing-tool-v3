<template>
  <div style='width: 100%;height: 100%'>
    <ag-grid-vue
      style='width: 100%;height: 90%'
      class='ag-theme-alpine'
      :rowData='rowData'
      :columnDefs='columnDefs'
      :defaultColDef='defaultColDef'
      :getRowId='getRowId'
      suppressRowHoverHighlight='true'
      @cellClicked='onCellClicked'
      rowSelection='single'
      :navigateToNextCell='navigateToNextCell'
      @grid-ready='onGridReady'>
    </ag-grid-vue>
    <div class='d-flex flex-wrap justify-center fixed'>
      <v-btn class='mx-5' @click='addNewPaket'>Neues Arbeitspaket anlegen</v-btn>
      <v-btn class='mx-5' @click='addNewKindPaket'>Neues Arbeitspaket als Kind anlegen</v-btn>
      <v-btn class='mx-5' @click='removeItem'>Arbeitspaket löschen</v-btn>
      <v-btn class='mx-5'>Bucket zuweisen</v-btn>
      <v-btn @click='movePaketLeft' class='mx-5'>
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-btn @click='movePaketRight' class='mx-5'>
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
      <v-btn @click='movePaketUp' class='mx-5'>
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
      <v-btn @click='movePaketDown' class='mx-5'>
        <v-icon>mdi-arrow-down</v-icon>
      </v-btn>
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
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridVue } from 'ag-grid-vue3'
import TreeDataCellRenderer from '@/components/TreeDataCellRenderer.vue'

import { usePaketeStore } from '@/stores/pakete'
import { nextTick } from 'vue'

export default {
  name: 'PaketUebersichtView',
  data() {
    return {
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        editable: true
      },
      columnDefs: [
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
          minWidth: 5,
          cellRenderer: TreeDataCellRenderer,
          cellRendererParams: {
            selectedRow: this.selectedRow
          }
        },
        {
          field: 'lvl',
          headerName: 'LVL'
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
        },
        {
          field: 'id',
          headerName: 'ID'
        }
      ]
    }
  },
  setup() {
    let getRowId = (params) => params.data.id
    const paketeStore = usePaketeStore()
    const rowData = paketeStore.paketeAsTreeView
    return { rowData, paketeStore, getRowId }
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
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellClicked(params) {
      this.selectedRow = params.data
    },
    addNewPaket() {
      this.paketeStore.addNew(null)
      this.gridApi.refreshCells({ force: true })
      nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
    },
    addNewKindPaket() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        this.paketeStore.addNew(this.gridApi.getSelectedRows()[0].id)
        this.gridApi.refreshCells({ force: true })
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
      }
    },
    removeItem() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        this.paketeStore.deletePaket(this.gridApi.getSelectedRows()[0].id)
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
      }
    },
    movePaketUp() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        this.paketeStore.moveUp(this.gridApi.getSelectedRows()[0].id)
        this.gridApi.refreshCells({ force: true })
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
      }
    },
    movePaketDown() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        this.paketeStore.moveDown(this.gridApi.getSelectedRows()[0].id)
        this.gridApi.refreshCells({ force: true })
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
      }
    },
    movePaketLeft() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveLeft(this.gridApi.getSelectedRows()[0].id)
        this.gridApi.refreshCells({ force: true })
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
      }
    },
    movePaketRight() {
      if (this.gridApi.getSelectedRows()[0]) {
        this.paketeStore.moveRight(this.gridApi.getSelectedRows()[0].id)
        this.gridApi.refreshCells({ force: true })
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView))
      }
    },
    navigateToNextCell(params) {
      const suggestedNextCell = params.nextCellPosition
      const KEY_UP = 'ArrowUp'
      const KEY_DOWN = 'ArrowDown'
      const noUpOrDownKeyPressed =
        params.key !== KEY_DOWN && params.key !== KEY_UP
      if (noUpOrDownKeyPressed || !suggestedNextCell) {
        return suggestedNextCell
      }
      params.api.forEachNode(function(node) {
        if (node.rowIndex === suggestedNextCell.rowIndex) {
          node.setSelected(true)
        }
      })
      return suggestedNextCell
    }
  }
}

</script>

<style>

</style>
