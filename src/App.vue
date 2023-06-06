<template>
  <v-app >
    <v-main >
      <AppBar></AppBar>
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

</script>