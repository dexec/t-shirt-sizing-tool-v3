<template>
  <div :style="'margin-left:' + this.params.node.data.lvl * 20 + 'px'">
    <v-btn size="x-small" :style="this.params.node.data.children.length>0 ? 'visibility:visible':'visibility:hidden'"
           @click="changeOpenState">
      <v-icon size="x-small" v-if="!this.params.node.data.open">mdi-plus</v-icon>
      <v-icon size="x-small" v-else>mdi-minus</v-icon>
    </v-btn>
    {{ this.params.value }}
  </div>
</template>

<script>

export default {
  name: "TestComp",
  methods: {
    shift() {
      return "margin-left: " + this.params.node.data.lvl * 20 + "px"
    },
    changeOpenState() {
      let aktuellesPaket = this.$store.getters.asList.find(paket => paket.id === this.params.node.data.id)
      //this.$store.commit('unterElementeInvisibleSchalten',aktuellesPaket)
      aktuellesPaket.open = !aktuellesPaket.open
      /*for (let child of aktuellesPaket.children) {
        child.visible = !child.visible
        this.$store.commit('updatePaket', child)
      }*/
      this.$store.commit('unterElementeInvisibleSchalten', aktuellesPaket)
      this.$store.commit('updatePaket', aktuellesPaket)
      /*      const updated = this.params.node.data;
            this.params.node.updateData(updated)*/
    }
  }
}
</script>

<style scoped>

</style>