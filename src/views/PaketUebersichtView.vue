<template>
  <div style="width: 100%;height: 100%">
    <ag-grid-vue
        style="width: 100%;height: 90%"
        class="ag-theme-alpine"
        :rowData="rowData"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        suppressRowHoverHighlight="true"
        @grid-ready="onGridReady">
    </ag-grid-vue>
    <v-card class="d-flex justify-center fixed">
      <v-btn :disabled="this.selectedRow === null" class="mx-5" @click="addNewPaket">Neues Arbeitspaket anlegen</v-btn>
      <v-btn :disabled="this.selectedRow === null" class="mx-5" @click="removeItem">Arbeitspaket löschen</v-btn>
      <v-btn :disabled="this.selectedRow === null" class="mx-5">Bucket zuweisen</v-btn>
    </v-card>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";
import TreeDataCellRenderer from "@/components/TreeDataCellRenderer.vue";

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
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
          minWidth: 5,
          cellRenderer: TreeDataCellRenderer
        },
        {
          field: 'thema',
          headerName: 'Thema',
        },
        {
          field: 'beschreibung',
          headerName: 'Beschreibung',
        },
        {
          field: 'komponente',
          headerName: 'Komponente',
        },
        {
          field: 'bucket',
          headerName: 'Bucket',
          editable: false
        },
        {
          field: 'schaetzung',
          headerName: 'Schätzung',
        },
      ],

    }
  },
  /*setup() {
    const store = useStore();
    return {
      rowData: computed(() => store.state.paketeAsTreeView)
    }
  },*/
  computed: {
    rowData: {
      get() {
        return this.$store.state.paketeAsTreeView;
      }
    }
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
      this.columnApi = params.columnApi;
      //this.gridApi.getDisplayedRowAtIndex(0).setSelected(true)
    },
    onCellClicked(params) {
      this.selectedRow = params.data
    },
    addNewPaket() {
      this.$store.commit('addNew', this.selectedRow);
    },
    removeItem() {
      if (typeof this.selectedRow !== 'undefined') {
        this.$store.commit('deletePaket', this.selectedRow.id)
      }
    },
  }
}

</script>

<style>

</style>
