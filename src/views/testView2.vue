<template>
  <div style="height: 100%; width: 100%">
    <ag-grid-vue
        style="width: 100%; height: 100%"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        @grid-ready="onGridReady"></ag-grid-vue>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";
import TreeDataCellRenderer from "@/components/TreeDataCellRenderer.vue";

export default {
  name: "testView2",
  data() {
    return {
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: true
      },
      columnDefs: [
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
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
        }
      ]
    }
  },

  computed: {
    rowData() {
      return this.$store.state.paketeAsList.filter(paket => paket.visible)
    }
  },
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TreeDataCellRenderer
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
    }
  },
}
</script>

<style scoped>

</style>