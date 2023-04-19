<template>
  <div style='width: 100%;height: 100%'>
    <ag-grid-vue
        :columnDefs='columnDefs'
        :defaultColDef='defaultColDef'
        :getRowId='getRowId'
        :navigateToNextCell='navigateToNextCell'
        :rowData='rowData'
        class='ag-theme-alpine'
        rowSelection='single'
        style='width: 100%;height: 90%'
        suppressRowHoverHighlight='true'
        @cellValueChanged="onCellValueChanged"
        @grid-ready='onGridReady'>
    </ag-grid-vue>
    <div class='d-flex flex-wrap justify-center fixed'>
      <v-btn class='mx-5' @click='addNewPaket'>Neues Arbeitspaket anlegen</v-btn>
      <v-btn class='mx-5' @click='addNewKindPaket'>Neues Arbeitspaket als Kind anlegen</v-btn>
      <v-btn class='mx-5' @click='removeItem'>Arbeitspaket löschen</v-btn>
      <v-btn class='mx-5' @click="log">Bucket zuweisen</v-btn>
      <v-btn class='mx-5' @click='movePaketLeftUp'>
        <v-icon>mdi-arrow-top-left</v-icon>
      </v-btn>
      <v-btn class='mx-5' @click='movePaketLeftDown'>
        <v-icon>mdi-arrow-bottom-left</v-icon>
      </v-btn>
      <v-btn class='mx-5' @click='movePaketUp'>
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
      <v-btn class='mx-5' @click='movePaketDown'>
        <v-icon>mdi-arrow-down</v-icon>
      </v-btn>
      <v-btn class='mx-5' @click='movePaketUpRight'>
        <v-icon>mdi-arrow-top-right</v-icon>
      </v-btn>
      <v-btn class='mx-5' @click='movePaketDownRight'>
        <v-icon>mdi-arrow-bottom-right</v-icon>
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
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {AgGridVue} from 'ag-grid-vue3';
import TreeDataCellRenderer from '@/components/TreeDataCellRenderer.vue';

import {usePaketeStore} from '@/stores/pakete';
import {nextTick} from 'vue';
import DropDownCellRenderer from "@/components/DropDownCellRenderer.vue";

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
          editable: false,
          cellRenderer: DropDownCellRenderer
        },
        {
          field: 'schaetzung',
          headerName: 'Schätzung'
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
    const rowData = paketeStore.paketeAsTreeView;
    return {rowData, paketeStore, getRowId};
  },
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TreeDataCellRenderer,
    // eslint-disable-next-line vue/no-unused-components
    DropDownCellRenderer
  },
  methods: {
    /*    onFirstDataRendered(params) {
          params.api.sizeColumnsToFit();
          params.columnApi.autoSizeColumns()
        },*/
    log() {
      console.log(this.rowData)
    },
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellValueChanged(params) {
      this.paketeStore.updatePaket(params.data);
    },
    addNewPaket() {
      const newPaketID = this.paketeStore.addNew(null)
      this.refreshTable()
      nextTick(() => {
        this.gridApi.getRowNode(newPaketID).setSelected(true);
      });
    },
    addNewKindPaket() {
      if (this.gridApi.getSelectedRows()[0] != null) {
        const newPaketID = this.paketeStore.addNew(this.gridApi.getSelectedRows()[0].id);
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
        this.paketeStore.moveUp(this.gridApi.getSelectedRows()[0].id);
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
        this.gridApi.refreshCells({force: true});
        this.gridApi.setRowData(this.paketeStore.paketeAsTreeView)
      });
    },
    navigateToNextCell(params) {
      const suggestedNextCell = params.nextCellPosition;
      const KEY_UP = 'ArrowUp';
      const KEY_DOWN = 'ArrowDown';
      const noUpOrDownKeyPressed =
          params.key !== KEY_DOWN && params.key !== KEY_UP;
      if (noUpOrDownKeyPressed || !suggestedNextCell) {
        return suggestedNextCell;
      }
      params.api.forEachNode(function (node) {
        if (node.rowIndex === suggestedNextCell.rowIndex) {
          node.setSelected(true);
        }
      });
      return suggestedNextCell;
    }
  }
};

</script>

<style>

</style>
