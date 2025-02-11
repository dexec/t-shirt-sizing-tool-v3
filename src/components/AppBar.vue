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
      <v-divider class="border-opacity-100" color="white" vertical></v-divider>
      <v-tab class="text-capitalize" style="color: white" to="/projektKonfig">Projektübersicht</v-tab>
      <v-tab value="/pakete" class="text-capitalize" style="color: white" to="/pakete">Paketübersicht</v-tab>
      <v-tab v-if="konfigContainer.bucketmodus" class="text-capitalize" style="color: white" to="/vergleich">Vergleich
      </v-tab>
      <v-tab class="text-capitalize" style="color: white" to="/statistikenService">Statistiken</v-tab>
      <v-tab class="text-capitalize" style="color: white" to="/aufschlaege">Projektaufschläge</v-tab>
<!--
      <v-tab class="text-capitalize" style="color: white" to="/test">Test</v-tab>
-->
    </v-tabs>
    <v-spacer/>
    <HelperComponent :entries-prop="entriesHelperComp"></HelperComponent>
    <input class="searchfield mr-2 pl-1" placeholder="Paket suchen" readonly @click="toggleSuche()">

  </v-app-bar>
  <SuchComponent v-if="showSuche" :toggle-suche="toggleSuche"
                 style="height: 100%"></SuchComponent>


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

  <input ref="fileRef" accept=".tsize" hidden type="file" @change="handleFileUpload">
</template>

<script lang="ts" setup>
import { useKonfigContainer } from "@/stores/konfigContainer";
import { ExportProject } from "@/models/ExportProject";
import { ExportAsExcel } from "@/models/ExportAsExcel";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import { computed, ref } from "vue";
import { ImportProject } from "@/models/ImportProject.js";
import router from "@/router/index.js";
import SuchComponent from "@/components/SuchComponent.vue";
import { useRoute } from "vue-router";
import HelperComponent from "@/components/HelperComponent.vue";
import {aufschlaege, pakete, projekt, statistiken, vergleich} from "@/stores/helperStrings";

const konfigContainer = useKonfigContainer();
const showSuche = ref(false);
const route = useRoute();
const tabs = computed(() => "/" + route.fullPath.split("/")[1]);

const entriesHelperComp = computed(() => {
  if(tabs.value=="/projektKonfig") return projekt();
  if(tabs.value=="/pakete") return pakete();
  if(tabs.value=="/vergleich") return vergleich();
  if(tabs.value=="/statistikenService") return statistiken();
  if(tabs.value=="/aufschlaege") return aufschlaege();
  return "";
})
function toggleSuche() {
  showSuche.value = !showSuche.value;
}

function downloadProject() {
  const exportProject = new ExportProject();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(exportProject.createFile());
  link.download = konfigContainer.projektname+".tsize";

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
}


const fileRef = ref<HTMLInputElement | null>(null);

function loadProject() {
  fileRef.value?.click();
}

function handleFileUpload(event: any) {
  const file = event.target.files[0];
  if (file.name.endsWith(".tsize")) {
    console.log("hier")
    const reader = new FileReader();
    reader.onload = () => {
      const fileContents = reader.result;
      const jsonFile = JSON.parse(fileContents as string);
      if (jsonFile.buckets && jsonFile.eintraege && jsonFile.pakete && jsonFile.paketeTree) {
        new ImportProject(JSON.stringify(jsonFile));
        router.push("/projektKonfig");
      }
    };
    reader.readAsText(file);
  }
}
</script>
<style scoped>
.searchfield {
  width: 200px;
  height: 80%;
  background-color: white
}

</style>