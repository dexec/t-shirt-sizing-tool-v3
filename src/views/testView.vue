<template>
  <v-tooltip v-model="isActive">
    <template v-slot:activator="{props}">
      <v-icon v-bind="props" @mouseenter="isHovered=true" @mouseleave="isHovered=false"  icon="mdi-help"></v-icon>
    </template>
  </v-tooltip>
  <v-btn @click="isActive=!isActive"></v-btn>
  {{isHovered}}
</template>

<script lang="ts" setup>
import {ref, watch} from "vue";
const isActive = ref(false)
const isHovered = ref(false)

 watch( isHovered, (newState) => {
   console.log(newState);
 })

</script>