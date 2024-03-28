<template>
  <v-app-bar color="#03787c" flat>
<!--    TODO Icon einbauen-->
    <v-tabs>
      <v-tab title="Projekt erstellen" @click="showDialog=true"><v-icon icon="mdi-folder-plus"></v-icon></v-tab>
      <v-tab title="Projekt speichern" @click="downloadProject"><v-icon icon="mdi-content-save-outline"></v-icon></v-tab>
      <v-tab title="Projekt laden" @click="loadProject"><v-icon icon="mdi-folder-upload-outline"></v-icon></v-tab>
      <v-tab title="Projekt als Excel Tabelle runterladen" @click="downloadExcel"><v-icon icon="mdi-file-excel-outline"></v-icon></v-tab>
      <v-tab style="color: white" to="/projekt">Projektübersicht</v-tab>
      <v-tab style="color: white" to="/pakete">Paketübersicht</v-tab>
      <v-tab style="color: white" v-if="projektStore.bucketmodus" to="/vergleich">Vergleich</v-tab>
      <v-tab style="color: white" to="/buckets">Bucketübersicht</v-tab>
      <v-tab style="color: white" to="/kalkulation">Projektkalkulation</v-tab>
      <v-tab style="color: white" to="/test">Test</v-tab>
    </v-tabs>
  </v-app-bar>
  <ConfirmDialog v-model="showDialog" @cancel="cancelCreateNewProject" @confirm="createNewProject">
    <template #question>Möchten Sie wirklich ein neues Projekt laden? Alle ungesicherten Daten gehen verloren!</template>
    <template #confirmText>Bestätigen</template>
    <template #cancelText>Abbrechen</template>
  </ConfirmDialog>
  <input ref="fileRef" accept=".json" hidden type="file" @change="handleFileUpload">
</template>
<script setup lang="ts">
  import {useProjektStore} from "@/stores/projekt";
  import { ExportProject } from "@/components/ExportProject";
  import { ExportAsExcel } from "@/components/ExportAsExcel";
  import ConfirmDialog from "@/components/ConfirmDialog.vue";
  import {ref} from "vue";
  import {ImportProject} from "@/components/ImportProject.js";
  import router from "@/router/index.js";
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

  const showDialog = ref(false);
  function createNewProject() {
    document.location.reload()
  }
  function cancelCreateNewProject() {

  }

  const fileRef = ref<HTMLInputElement | null>(null);
  function loadProject() {
    fileRef.value?.click();
  }
  function handleFileUpload(event: any) {
    const file = event.target.files[0];
    if (file.type == "application/json") {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContents = reader.result;
        const jsonFile = JSON.parse(fileContents as string);
        if (jsonFile.buckets && jsonFile.eintraege && jsonFile.pakete && jsonFile.paketeTree) {
          new ImportProject(JSON.stringify(jsonFile));
          router.push("/projekt");
        }
      };
      reader.readAsText(file);
    }
  }
</script>
