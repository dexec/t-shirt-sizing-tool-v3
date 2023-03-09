<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue
      style="width: 100%;height: 90%"
      class="ag-theme-alpine"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      suppressRowHoverHighlight="true"
      @cellClicked="onCellClicked"
      @grid-ready="onGridReady">
    </ag-grid-vue>
    <v-card class="d-flex justify-center fixed">
      <v-btn class="mx-5" @click="addNewPaket">Neues Arbeitspaket anlegen</v-btn>
      <v-btn :disabled="this.selectedRow === null" class="mx-5" @click="addNewKindPaket">Neues Arbeitspaket als Kind anlegen</v-btn>
      <v-btn :disabled="this.selectedRow === null" class="mx-5" @click="removeItem">Arbeitspaket löschen</v-btn>
      <v-btn :disabled="this.selectedRow === null" class="mx-5">Bucket zuweisen</v-btn>
    </v-card>
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
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { AgGridVue } from "ag-grid-vue3";
import TreeDataCellRenderer from "@/components/TreeDataCellRenderer.vue";

import { usePaketeStore } from "@/stores/pakete";
import { nextTick } from "vue";

export default {
  name: "PaketUebersichtView",
  data() {
    return {
      gridApi: null,
      columnApi: null,
      selectedRow: null,
      defaultColDef: {
        editable: true
      },
      columnDefs: [
        {
          field: "ticket_nr",
          headerName: "Ticket-NR",
          minWidth: 5,
          cellRenderer: TreeDataCellRenderer
        },
        {
          field: "thema",
          headerName: "Thema"
        },
        {
          field: "beschreibung",
          headerName: "Beschreibung"
        },
        {
          field: "komponente",
          headerName: "Komponente"
        },
        {
          field: "bucket",
          headerName: "Bucket",
          editable: false
        },
        {
          field: "schaetzung",
          headerName: "Schätzung"
        }
      ]

    };
  },
  setup() {
    const paketeStore = usePaketeStore();
    const rowData = paketeStore.paketeAsTreeView;
    return { rowData, paketeStore };
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
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellClicked(params) {
      this.selectedRow = params.data;
    },
    addNewPaket() {
      this.paketeStore.addNew(null);
      nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView));
    },
    addNewKindPaket() {
      this.paketeStore.addNew(this.selectedRow);
      nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView));
    },
    removeItem() {
      if (this.selectedRow!=null) {
        this.paketeStore.deletePaket(this.selectedRow.id);
        nextTick(() => this.gridApi.setRowData(this.paketeStore.getTreeView));
      }
      this.selectedRow=null
    }
  }
};

</script>

<style>

</style>
