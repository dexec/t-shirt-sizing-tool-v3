<template>
  <div style="height: 100%">
    <ag-grid-vue
        style="width: 100%; height: 100%;"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        @grid-ready="onGridReady"
        :defaultColDef="defaultColDef"
        :animateRows="true"
        :rowData="rowData"></ag-grid-vue>
    <v-btn @click="changeName">Change</v-btn>
  </div>
  <!--  <ag-grid-vue
        style="width: 100%; height: 100%;"
        class="ag-theme-alpine"
        :columnDefs="columnDefs"
        @grid-ready="onGridReady"
        :defaultColDef="defaultColDef"
        :rowSelection="rowSelection"
        :rowData="rowData"></ag-grid-vue>-->

</template>

<script>
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {AgGridVue} from "ag-grid-vue3";

export default {
  name: "testView",
  data() {
    return {
      columnDefs: [
        {field: 'country'},
        {field: 'year'},
        {field: 'athlete'},
      ],
      rowData: [
        {
          country: 'Germany',
          year: 1998,
          athlete: 'Daniel'
        }
      ],
      gridApi: null,
      columnApi: null,
      defaultColDef: {
        flex: 1,
        minWidth: 120,
        resizable: true,
      },
    };
  },
  components: {
    'ag-grid-vue': AgGridVue
  },
  methods: {
    onGridReady(params) {
      this.gridApi = params.api;
      this.gridColumnApi = params.columnApi;
    },
    changeName() {
      const id = undefined
      this.gridApi.forEachNode((node) => {
        node.updateData({...node.data, id})
      })
    }
  },
};
/*export default {
  name: "testView",
  data() {
    return {
      visible: false,
      newBucketName: '',
      alleBucketsBerarbeitenModus: false,
      currentSelectedBucket: '',
      currentEditBucket: '',
      buckets: [{id: 0, name: 'XS'}, {id: 1, name: 'S'}, {id: 2, name: 'M'}, {id: 3, name: 'L'}, {id: 4, name: 'XL'}],
      tickets: [{id: 0, thema: 'UI erstellen', bucket: 'S'}, {id: 1, thema: 'Suchfunktion', bucket: 'XS'}, {
        id: 2,
        thema: 'Migration',
        bucket: 'M'
      }],
    }
  },
  methods: {
    editBucket() {
      if (this.newBucketName !== '') this.buckets[this.buckets.map(bucket => bucket.name).indexOf(this.currentEditBucket)].name = this.newBucketName
      this.newBucketName = ''
      this.currentSelectedBucket = ''
      this.currentEditBucket = ''
    },
    loeschenBucket() {
      this.buckets.splice(this.buckets.map(bucket => bucket.name).indexOf(this.currentSelectedBucket), 1)
      this.currentSelectedBucket = ''
      for (let i = 0; i < this.buckets.length; i++) {
        this.buckets[i].id = i
      }
    },
    speichernBuckets() {
      this.clearData()
      this.$store.commit('updateAllBuckets', this.buckets)
    },
    abbrechen() {
      this.clearData()
      for (let i = 0; i < this.buckets.length; i++) {
        this.buckets[i] = JSON.parse(JSON.stringify(this.buckets[i]))
      }
    },
    clearData() {
      this.alleBucketsBerarbeitenModus = false
      this.newBucketName = ''
      this.currentSelectedBucket = ''
      this.currentEditBucket = ''
    }
  },
  computed: {
    file() {
      return this.$store.state.file
    }
  }
}*/
</script>

<style>
.bucket {
  border: 1px solid black;
  width: 100px;
  height: 100px;
  display: inline-block;
  text-align: center;
  vertical-align: middle;
  line-height: 100px;
}

.invisible {
  visibility: hidden;
}
</style>