<template>
  <div style="height: 100%; width: 100%">
    <ag-grid-vue
        style="width: 100%; height: 100%"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        :rowData="rowData"
        :defaultColDef="defaultColDef"
        @grid-ready="onGridReady"></ag-grid-vue>
    <v-btn @click="addNew">Add new</v-btn>
  </div>
</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";
import TestRenderer from "@/components/TestRenderer.vue";
import {useStore} from "vuex";
import {computed} from "vue";

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
          cellRenderer: TestRenderer
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
  setup() {
    const store = useStore();
    return {
      rowData: computed(() => store.state.paketeAsTreeView)
    }
  },
  components: {
    AgGridVue,
    // eslint-disable-next-line vue/no-unused-components
    TestRenderer
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.columnApi = params.columnApi;
    },
    addNew() {
      const newItems = [{
        id: 100,
        ticket_nr: 111222,
        thema: "Testticket",
        beschreibung: "Ticket zum Stresstesten",
        komponente: "Test",
        bucket: null,
        schaetzung: null,
        visible: null,
        open: false,
        parent: null,
        children: []
      }]
      this.gridApi.applyTransaction({add: newItems})
    }
  },
}
</script>

<style scoped>

</style>