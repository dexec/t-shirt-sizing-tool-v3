<template>
  <v-app>
    <v-main>
      <AppBar></AppBar>
      <RouterView/>
    </v-main>
  </v-app>
</template>

<style lang="scss">

</style>
<script>
import AppBar from "@/components/AppBar.vue";

export default {
  name: 'App',
  components: {AppBar}
};
</script>