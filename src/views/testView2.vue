<template>
  <v-container>
  <v-row id="abc">
    <input type="file" @change="handleFileUpload">
  </v-row>
  </v-container>
</template>

<script lang="ts">
import {ImportProject} from "@/components/ImportProject";
export default {
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const fileContents = reader.result;
        const importProject = ImportProject.getInstance()
        importProject.initialize(fileContents as string)
      };
      reader.readAsText(file);
    }
  }
};
</script>
<script setup lang="ts">
import {onMounted} from "vue";

</script>
<style scoped>
#drop-area {
  border: 2px dashed #ccc;
  border-radius: 20px;
  width: 480px;
  font-family: sans-serif;
  margin: 100px auto;
  padding: 20px;
}
#drop-area.highlight {
  border-color: purple;
}
p {
  margin-top: 0;
}
.my-form {
  margin-bottom: 10px;
}
#gallery {
  margin-top: 10px;
}
#gallery img {
  width: 150px;
  margin-bottom: 10px;
  margin-right: 10px;
  vertical-align: middle;
}
.button {
  display: inline-block;
  padding: 10px;
  background: #ccc;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid #ccc;
}
.button:hover {
  background: #ddd;
}
#fileElem {
  display: none;
}

</style>