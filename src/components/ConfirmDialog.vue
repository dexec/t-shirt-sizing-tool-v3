<template>
  <div id="confirmDialogContainer" class="text-center">
    <v-dialog
      v-model="dialog"
      width="auto"
    >
      <v-card>
        <v-card-text>
          {{ props.text }}
        </v-card-text>
        <v-card-actions class="d-flex flex-column">
          <v-btn block color="primary" @click="dialog = false; confirmFunction()" @keydown.enter="log()">Bestätigen
          </v-btn>
          <v-btn block color="primary" @click="dialog = false; cancelFunction()">Abbrechen
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";

const props = defineProps(["text", "confirmFunction", "cancelFunction"]);
const dialog = ref(false);

//TODO Keyboard shortcuts
function log() {
  console.log('abc')
}
function showDialog() {
  dialog.value = true;
}
/*
onMounted(() => {
  document.addEventListener("keyup", (e) => {
    if (dialog.value) {
      if (e.key == "Enter" || e.key == "Esc") {
        dialog.value = false;
        document.getElementById('confirmDialogContainer')?.focus()
        if (e.key == "Enter") props.confirmFunction();
        else if (e.key == "Esc") props.cancelFunction();
      }
    }
  });
});*/

defineExpose({ showDialog });
</script>
<style scoped>

</style>