
<template>
  <v-tooltip v-model="showHelp" :open-on-hover="false" location="bottom" >
    <template #activator="{props}">
      <v-icon class="mr-2" icon="mdi-help-circle-outline" v-bind="props"
              @click="showHelp=!showHelp"
              @mouseleave="showHelp=false"
      >
      </v-icon>

    </template>
    <div v-for="entry of entriesProp" :key="entriesProp.indexOf(entry)">
      {{entry}}
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
import {ref} from "vue";

const props = defineProps(["entriesProp"]);
const showHelp = ref(false)
</script>


<style scoped>

</style>