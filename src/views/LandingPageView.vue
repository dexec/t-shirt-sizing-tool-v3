<template>
  <div class="d-flex align-center justify-center fill-height flex-column">
    <h1>Schätzungstool</h1>
    <v-sheet :height="600" :width="600" border="md" class="d-flex flex-column align-center justify-center"
             color="#978A87">
      <v-btn class="mb-5" height="150" width="300" @click="createNewProject">Neues Projekt anlegen</v-btn>
      <v-btn class="mb-5" height="150" width="300" @click="createNewSample">Sample Projekt anlegen</v-btn>
      <v-btn height="150" width="300" @click="uploadFile">Projekt laden</v-btn>
      <input ref="fileRef" accept=".json" hidden type="file" @change="handleFileUpload">
    </v-sheet>
  </div>
</template>
<style scoped>
</style>
<script lang="ts" setup>
import {ref} from "vue";
import {ImportProject} from "@/components/ImportProject";
import router from "@/router";
import saveFile from "@/stores/file.json"
import {useLandingpageStore} from "@/stores/landingpage";
function createNewProject() {
  const emptyProject = '{\n' +
      '  "projekt": {\n' +
      '    "projektname": "",\n' +
      '    "projektbeschreibung": "",\n' +
      '    "bucketmodus": true\n' +
      '  },\n' +
      '  "eintraege": [],\n' +
      '  "buckets": [],\n' +
      '  "pakete": [],\n' +
      '  "paketeTree": []\n' +
      '}'
  const importProject = ImportProject.getInstance()
  importProject.initialize(emptyProject)
  useLandingpageStore().geladen = true
  router.push('/projekt')
}

function createNewSample() {
  const importProject = ImportProject.getInstance();
  importProject.initialize(JSON.stringify(saveFile));
  useLandingpageStore().geladen = true
  router.push('/projekt')
}

const fileRef = ref<HTMLInputElement | null>(null);

function uploadFile() {
  fileRef.value?.click();
}

function handleFileUpload(event: any) {
  const file = event.target.files[0];
  if (file.type == "application/json") {
    const reader = new FileReader();
    reader.onload = () => {
      const fileContents = reader.result;
      const importProject = ImportProject.getInstance()
      const jsonFile = JSON.parse(fileContents as string);
      if (jsonFile.buckets && jsonFile.eintraege && jsonFile.pakete && jsonFile.paketeTree) {
        importProject.initialize(JSON.stringify(jsonFile))
        useLandingpageStore().geladen = true
        router.push('/projekt')
      }
    };
    reader.readAsText(file);
  }
}


const showOverlay = ref(true)
</script>