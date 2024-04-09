<template>
<!--  TODO Scroll-Bar in der ganzen Anwendung entfernen!-->
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
import saveFile from "@/stores/file.json";
new ImportProject(JSON.stringify(saveFile));
</script>