<template>
  <div class="blurred-div">
    <div class="content">
      <v-text-field placeholder="Paket suchen"></v-text-field>
    </div>
  </div>
</template>

<script lang="ts" setup>

</script>

<style scoped>
.blurred-div {
  /* Styles for the blurred div */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(); /* Adjust the blur radius as needed */
  z-index: 2002; /* Ensure the blurred div is on top */
  background-color: rgba(12, 3, 3, 0.84); /* Add a semi-transparent background color for better visibility */
}

.content {
  position: absolute;
  background-color: white;
  right: 0;
  top: 0;
  width: 30%;
  height: 100%;
  border: black solid 1px
}
</style>