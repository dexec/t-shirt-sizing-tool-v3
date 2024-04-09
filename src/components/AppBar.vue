<template>
  <v-app-bar color="#03787c" flat>
    <!--    TODO Icon einbauen-->
    <v-tabs>
      <v-tab title="Projekt erstellen" @click="showDialogCreateNewProject=true">
        <v-icon icon="mdi-folder-plus"></v-icon>
      </v-tab>
      <v-tab title="Projekt speichern" @click="downloadProject">
        <v-icon icon="mdi-content-save-outline"></v-icon>
      </v-tab>
      <v-tab title="Projekt laden" @click="showDialogLoadProject=true">
        <v-icon icon="mdi-folder-upload-outline"></v-icon>
      </v-tab>
      <v-tab title="Projekt als Excel Tabelle runterladen" @click="downloadExcel">
        <v-icon icon="mdi-file-excel-outline"></v-icon>
      </v-tab>
      <v-divider color="#4df0b4" class="border-opacity-100" :thickness="15" vertical></v-divider>
      <v-tab style="color: white" to="/projekt" class="text-capitalize" >Projektübersicht</v-tab>
      <v-tab style="color: white" to="/pakete" class="text-capitalize">Paketübersicht</v-tab>
      <v-tab v-if="projektStore.bucketmodus" style="color: white" to="/vergleich" class="text-capitalize">Vergleich</v-tab>
      <v-tab style="color: white" to="/buckets" class="text-capitalize">Bucketübersicht</v-tab>
      <v-tab style="color: white" to="/kalkulation" class="text-capitalize">Projektkalkulation</v-tab>
      <v-tab style="color: white" to="/test" class="text-capitalize">Test</v-tab>
    </v-tabs>
  </v-app-bar>
  <ConfirmDialog v-model="showDialogCreateNewProject" @confirm="createNewProject">
    <template #question>Möchten Sie wirklich ein neues Projekt erstellen? Alle ungesicherten Daten gehen verloren!
    </template>
    <template #confirmText>Bestätigen</template>
    <template #cancelText>Abbrechen</template>
  </ConfirmDialog>
  <ConfirmDialog v-model="showDialogLoadProject" @confirm="loadProject">
    <template #question>Möchten Sie wirklich ein neues Projekt laden? Alle ungesicherten Daten gehen verloren!
    </template>
    <template #confirmText>Bestätigen</template>
    <template #cancelText>Abbrechen</template>
  </ConfirmDialog>
  <input ref="fileRef" accept=".json" hidden type="file" @change="handleFileUpload">
</template>

<script lang="ts" setup>
import { useProjektStore } from "@/stores/projekt";
import { ExportProject } from "@/models/ExportProject";
import { ExportAsExcel } from "@/models/ExportAsExcel";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { ref } from "vue";
import { ImportProject } from "@/models/ImportProject.js";
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

const showDialogCreateNewProject = ref(false);
const showDialogLoadProject = ref(false);

function createNewProject() {
  const emptyProject = "{\n" +
    "  \"projekt\": {\n" +
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
  router.push('/projekt')
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
<style scoped>


</style>