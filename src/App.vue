<template>
  <v-app>
    <v-main>
      <AppBar></AppBar>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<style lang="scss">

</style>
<script lang="ts" setup>
import AppBar from "@/components/AppBar.vue";
import {ImportProject} from "@/models/ImportProject";
import router from "@/router";
const emptyProject = "{\n" +
    "  \"projektKonfig\": {\n" +
    "    \"projektname\": \"Neues Projekt\",\n" +
    "    \"bucketmodus\": true,\n" +
    "    \"aufschlaegeErklaeren\": false,\n" +
    "    \"nachkommastellen\": 2\n" +
    "  },\n" +
    "  \"eintraege\": [],\n" +
    "  \"checkboxIds\": [0,1,2],\n" +
    "  \"buckets\": [{\n" +
    "      \"id\": 0,\n" +
    "      \"name\": \"S\"\n" +
    "    },\n" +
    "    {\n" +
    "      \"id\": 1,\n" +
    "      \"name\": \"M\"\n" +
    "    },\n" +
    "    {\n" +
    "      \"id\": 2,\n" +
    "      \"name\": \"L\"\n" +
    "    }],\n" +
    "  \"pakete\": [],\n" +
    "  \"paketeTree\": []\n" +
    "}";
new ImportProject(emptyProject);
router.push("/projektKonfig");
</script>