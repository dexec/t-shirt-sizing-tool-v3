<template>
  <div style="height: 100%; width: 100%">
    <ag-grid-vue
        style="width: 100%; height: 100%"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        :getRowId="getRowId"
        @grid-ready="onGridReady"></ag-grid-vue>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";
import TestComp from "@/components/TestComp.vue";

export default {
  name: "testView2",
  data() {
    return {
      getRowId: null,
      gridApi: null,
      columnApi: null,
      rowData: null,
      defaultColDef: {
        sortable: true,
        filter: true,
        editable: true
      },
      columnDefs: [
        {
          field: 'ticket_nr',
          headerName: 'Ticket-NR',
          minWidth: 5,
          cellRenderer: 'TestComp',
          cellRendererParams: {
            items: null
          }
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
        {
          field: 'visible',
          headerName: 'visible'
        }
      ]
    }
  },
  computed: {
    paketeAsList() {
      return this.$store.getters.asList
    }
  },
  setup() {
    this.rowData = []
  },
  beforeCreate() {

  },
  created() {
    this.getRowId = (params) => params.data.id
  },
  mounted() {
    //this.rowData = this.paketeAsList
  },
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TestComp
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