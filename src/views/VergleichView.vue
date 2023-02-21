<template>
  <v-container fluid class="fill-height">
    <v-row class="fill-height">
      <v-col align-self="center" class="justify-start" cols="1">
<!--        <v-btn
            color="pink"
            @click.stop="drawer = !drawer"
        >
          Toggle
        </v-btn>-->
        <v-navigation-drawer
            v-model="drawer"
            permanent
        >
          <v-checkbox v-for="bucket in buckets" :key="bucket.id" v-model="selected" :value="bucket.id"
                      :label=bucket.name @change="sortSelectedBuckets">
          </v-checkbox>
        </v-navigation-drawer>
      </v-col>
      <v-col cols="9" class="d-flex flex-column">
        <v-row justify="center">
          <v-btn
              class="ma-2"
              color="primary"
              dark
          >
            Accept
            <v-icon
                dark
                right
            >
              mdi-checkbox-marked-circle
            </v-icon>
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
          <v-btn
              class="ma-2"
              color="primary"
              dark
          >
            Accept
            <v-icon
                dark
                right
            >
              mdi-checkbox-marked-circle
            </v-icon>
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
            <tr v-for="ticket in tickets.filter(ticket => ticket.bucket===buckets.find(bucket => bucket.id === selectedBuckedId).name)"
                :key="ticket.id">
              <td>{{ ticket.id }}</td>
              <td>{{ ticket.thema }}</td>
            </tr>
          </v-table>
        </v-row>
      </v-col>
      <v-col cols="2">
<!--          <v-btn
              color="pink"
              dark
              @click.stop="drawer2 = !drawer2"
          >
            Toggle
          </v-btn>-->
        <v-navigation-drawer
            v-model="drawer2"
            permanent
            right
        >
          <v-table>
            <tr>
              <th>ID</th>
              <th>Thema</th>
            </tr>
            <tr v-for="ticket in tickets" :key="ticket.id">
              <td>{{ ticket.id }}</td>
              <td>{{ ticket.thema }}</td>
            </tr>
          </v-table>
        </v-navigation-drawer>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "VergleichView",
  data() {
    return {
      checked: true,
      drawer: null,
      drawer2: null,
      mini: true,
      selected: [0, 1, 2, 3, 4],
      buckets: [{id: 0, name: 'XS'}, {id: 1, name: 'S'}, {id: 2, name: 'M'}, {id: 3, name: 'L'}, {id: 4, name: 'XL'}],
      tickets: [{id: 0, thema: 'UI erstellen', bucket: 'S'}, {id: 1, thema: 'Suchfunktion', bucket: 'XS'}, {
        id: 2,
        thema: 'Migration',
        bucket: 'M'
      }]
    }
  },
  methods: {
    sortSelectedBuckets() {
      this.selected.sort(function (a, b) {
        return a - b
      })
    }
  }
}
</script>

<style>

</style>