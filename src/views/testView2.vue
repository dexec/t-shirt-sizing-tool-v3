<template>
  <div style='height: 100%; width: 100%'>
    <ag-grid-vue
      style='width: 100%; height: 90%'
      class='ag-theme-alpine'
      :columnDefs='columnDefs'
      :rowData='rowData'
      :getRowId='getRowId'
      :defaultColDef='defaultColDef'
      rowSelection='single'
      :navigateToNextCell='navigateToNextCell'
      @grid-ready='onGridReady'></ag-grid-vue>
    <v-btn @click='update'>update</v-btn>
  </div>
</template>

<script>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { AgGridVue } from 'ag-grid-vue3'
import { nextTick } from 'vue'
import {Paket} from "@/Paket";

export default {
  name: 'testView2',
  data() {
    return {
      selectedRow: null,
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        editable: true
      },
      columnDefs: [
        {
          field: 'id',
          headerName: 'ID'
        },
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR'
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
      ]
    }
  },

  components: {
    AgGridVue
  },
  setup() {
    let getRowId = (params) => params.data.id
    const rowData = Paket[{
      id: 0,
      ticket_nr: 111222,
      thema: 'Testticket',
      beschreibung: 'Ticket zum Stresstesten',
      komponente: 'Test',
      bucket: null,
      schaetzung: null
    },
      {
        id: 1,
        ticket_nr: 111222,
        thema: 'Testticket',
        beschreibung: 'Ticket zum Stresstesten',
        komponente: 'Test',
        bucket: null,
        schaetzung: null
      },
      {
        id: 2,
        ticket_nr: 111222,
        thema: 'Testticket',
        beschreibung: 'Ticket zum Stresstesten',
        komponente: 'Test',
        bucket: null,
        schaetzung: null
      }]
    return { rowData, getRowId }
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api
      this.columnApi = params.columnApi
    },
    update() {
      const rowData = [{
        id: 5,
        ticket_nr: 111222,
        thema: 'Testticket',
        beschreibung: 'Ticket zum Stresstesten',
        komponente: 'Test',
        bucket: null,
        schaetzung: null
      },
        {
          id: 6,
          ticket_nr: 111222,
          thema: 'Testticket',
          beschreibung: 'Ticket zum Stresstesten',
          komponente: 'Test',
          bucket: null,
          schaetzung: null
        },
        {
          id: 7,
          ticket_nr: 111222,
          thema: 'Testticket',
          beschreibung: 'Ticket zum Stresstesten',
          komponente: 'Test',
          bucket: null,
          schaetzung: null
        }]
      nextTick(() => this.gridApi.setRowData(rowData))
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
      this.selectedRow = params.api.getSelectedRows()[0]
      return suggestedNextCell
    }
  }
}
</script>

<style scoped>

</style>