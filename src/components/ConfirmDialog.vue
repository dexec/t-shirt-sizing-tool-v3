<template>
  <div class="text-center">
    <v-dialog
      :model-value="props.modelValue"
      width="auto"
      @update:modelValue="onCancel"
    >
      <v-card>
        <v-card-text>
          <slot name="question">Sicher?</slot>
        </v-card-text>
        <v-card-actions class="d-flex flex-column">
          <v-btn block color="primary" @click="onConfirm">
            <slot name="confirmText">
              Bestätigen
            </slot>
          </v-btn>
          <v-btn block color="primary" @click="onCancel">
            <slot name="cancelText">
              Abbrechen
            </slot>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script lang="ts" setup>
import { nextTick, watch } from "vue";

const emit = defineEmits(["confirm", "cancel", "update:modelValue"]);
const props = defineProps<{ modelValue: boolean }>();

watch(() => props.modelValue, (isVisible) => {

  if (isVisible) {
    (document.activeElement as HTMLElement)?.blur();
    nextTick(() => {
      document.addEventListener("keyup", handleEvent, { capture: true });
    });
  } else {
    nextTick(() => {
      document.removeEventListener("keyup", handleEvent, { capture: true });
    });
  }
});

function handleEvent(e: KeyboardEvent) {
  e.preventDefault();
  if (e.key == "Enter") {
    emit("confirm");
    emit("update:modelValue", false);
  } else if (e.key == "Escape") {
    emit("cancel");
    emit("update:modelValue", false);
  }
}

function onCancel() {
  emit("cancel");
  emit("update:modelValue", false);
}

function onConfirm() {
  emit("confirm");
  emit("update:modelValue", false);
}
</script>
<style scoped>

</style>