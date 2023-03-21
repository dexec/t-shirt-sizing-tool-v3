<template>
  <v-container fluid class="fill-height">
    <v-row class="fill-height">
      <!--        <v-btn
                  color="pink"
                  @click.stop="drawer = !drawer"
              >
                Toggle
              </v-btn>-->
      <!--        <v-navigation-drawer
                  v-model="drawer"
              >
                <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :value="bucket.id"
                            :label=bucket.name @change="sortSelectedBuckets">
                </v-checkbox>
              </v-navigation-drawer>-->
      <v-col cols="9" class="d-flex flex-column">
        <v-row justify="center">
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-left</v-icon>
          </v-btn>
          <v-table style="width: 30%;">
            <tr>
              <th>ID</th>
              <th>Thema</th>
            </tr>
            <tr>
              <td>1</td>
              <td>Thema 1</td>
            </tr>
          </v-table>
          <v-btn class="ma-2" color="primary" dark>
            <v-icon dark right>mdi-arrow-right</v-icon>
          </v-btn>
        </v-row>
        <v-row class="d-flex flex-nowrap">
          <v-table v-for="selectedBuckedId in selected" :key="selected.indexOf(selectedBuckedId)" class="mr-4"
                   style="width: 30%">
            <tr>
              <th colspan="2">
                {{ buckets.find(bucket => bucket.id === selectedBuckedId).name }}
              </th>
            </tr>
            <tr v-for="paket in pakete.filter(currentPaket => currentPaket.bucket===buckets.find(bucket => bucket.id === selectedBuckedId).name)"
                :key="paket.id">
              <td style="width: 10%">{{ paket.id }}</td>
              <td>{{ paket.thema }}</td>
            </tr>
          </v-table>
        </v-row>
      </v-col>
      <v-col cols="3">
        <v-dialog v-model="dialog" width="auto">
          <template v-slot:activator="{props}">
            <v-btn class="mb-4" v-bind="props">Buckets konfigurieren</v-btn>
          </template>
          <v-card>
            <v-card-text>
              <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :value="bucket.id"
                          :label=bucket.name @change="sortSelectedBuckets">
              </v-checkbox>
            </v-card-text>
          </v-card>
        </v-dialog>
        <v-table>
          <tr>
            <th>ID</th>
            <th>Thema</th>
          </tr>
          <tr v-for="paket in pakete" :key="paket.id">
            <td>{{ paket.id }}</td>
            <td>{{ paket.thema }}</td>
          </tr>
        </v-table>
        <!--          <v-btn
                      color="pink"
                      dark
                      @click.stop="drawer2 = !drawer2"
                  >
                    Toggle
                  </v-btn>-->

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import {usePaketeStore} from "@/stores/pakete";
import {useBucketsStore} from "@/stores/buckets";

export default {
  name: "VergleichView",
  data() {
    return {
      dialog: false,
      checked: true,
      drawer: null,
      drawer2: null,
      mini: true,
      selected: [0, 1, 2, 3, 4],
    }
  },
  setup() {
    const paketeStore = usePaketeStore()
    const bucketStore = useBucketsStore()
    const buckets = bucketStore.getBuckets
    const pakete = paketeStore.getFlatView
    return {buckets, pakete}
  },
  methods: {
    sortSelectedBuckets() {
      this.selected.sort(function (a, b) {
        return a - b
      })
    }
  },
}
</script>

<style>

</style>