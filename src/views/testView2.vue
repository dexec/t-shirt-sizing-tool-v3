<template>
  <v-btn @click="test"></v-btn>
</template>

<script>
import {usePaketeStore} from "@/stores/pakete";

export default {
  name: "TestView2",
  data() {
    return {};
  },
  setup() {
    const paketeStore = usePaketeStore();
    return {paketeStore}
  },

  methods: {
    test() {
      for(const paket of this.paketeStore.getTreeView())
        console.log(paket.beschreibung)
    }
  }
}

</script>

<style>

</style>
