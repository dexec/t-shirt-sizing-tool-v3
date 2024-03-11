<template>
  <v-app-bar color="#03787c" flat>
<!--    TODO Icon einbauen-->
    <v-tabs>
      <v-tab title="Projekt als Excel Tabelle runterladen" @click="downloadExcel"><v-icon icon="mdi-file-excel-outline"></v-icon></v-tab>
      <v-tab title="Projekt als Datei runterladen" @click="downloadProject"><v-icon icon="mdi-content-save-outline"></v-icon></v-tab>
      <v-tab style="color: white" to="/projekt">Projektübersicht</v-tab>
      <v-tab style="color: white" to="/pakete">Paketübersicht</v-tab>
      <v-tab style="color: white" v-if="projektStore.bucketmodus" to="/vergleich">Vergleich</v-tab>
      <v-tab style="color: white" to="/buckets">Bucketübersicht</v-tab>
      <v-tab style="color: white" to="/kalkulation">Projektkalkulation</v-tab>
      <v-tab style="color: white" to="/test">Test</v-tab>
      <v-tab style="color: white" to="/test2">Test2</v-tab>
    </v-tabs>
  </v-app-bar>
</template>
<script setup>
  import {useProjektStore} from "@/stores/projekt";
  import { ExportProject } from "@/components/ExportProject";
  import { ExportAsExcel } from "@/components/ExportAsExcel";
  const projektStore = useProjektStore();

  function downloadProject() {
    const exportProject = new ExportProject();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(exportProject.createFile());
    link.download = "test";

    // Simulate a click on the link
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true
    });
    link.dispatchEvent(clickEvent);
  }

  function downloadExcel() {
    new ExportAsExcel().downloadExcelSheet();
  }
</script>
