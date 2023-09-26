<template>
  <div class="text-center">
    <v-dialog
        v-model="dialog"
        width="auto"
    >
      <v-card>
        <v-card-text>
          {{props.text}}
        </v-card-text>
        <v-card-actions class="d-flex flex-column">
          <v-btn color="primary" block @click="dialog = false; confirmFunction()">Bestätigen</v-btn>
          <v-btn color="primary" block @click="dialog = false; cancelFunction()">Abbrechen</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script setup lang="ts">
//TODO Keyboard shortcuts
import {ref} from "vue";
const props = defineProps(['text','confirmFunction','cancelFunction'])
const dialog = ref(false)

function showDialog() {
  dialog.value = true
}

defineExpose({showDialog})
</script>
<style scoped>

</style>