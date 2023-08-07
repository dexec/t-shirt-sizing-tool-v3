<template>
  <v-app>
    <v-main>
      <AppBar v-if="useVariablenAustauschStore().geladen"></AppBar>
      <router-view v-slot="{Component}">
        <keep-alive include="VergleichView">
          <component :is="Component"></component>
        </keep-alive>
      </router-view>
    </v-main>
  </v-app>
</template>

<style lang="scss">

</style>
<script lang="ts" setup>
import AppBar from "@/components/AppBar.vue";
import {useVariablenAustauschStore} from "@/stores/variablenAustausch";
</script>