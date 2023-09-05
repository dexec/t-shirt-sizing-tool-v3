<template>
  <div>
    <div class="original-div">
      <!-- Your original content here -->
      <v-btn @click="log()"></v-btn>
    </div>

    <button @click="createBlurredDiv">Create Blurred Div</button>

    <!-- Render the blurred div when the blurredDivVisible is true -->
    <div v-if="blurredDivVisible" class="blurred-div d-flex flex-column justify-center">
      <!-- Content for the blurred div -->
      <h2>Blurred Div Content</h2>
      <p>This is some content in the blurred div.</p>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';


const blurredDivVisible = ref(false) // Initially, the blurred div is not visible


function createBlurredDiv() {
  // Toggle the visibility of the blurred div
  blurredDivVisible.value = !blurredDivVisible.value;
}

function log() {
  console.log("log")
}
</script>

<style>
.original-div {
  /* Your styles for the original div */
  width: 300px;
  height: 200px;
  background-color: lightblue;
}

.blurred-div {
  /* Styles for the blurred div */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(10px); /* Adjust the blur radius as needed */
  z-index: 1; /* Ensure the blurred div is on top */
  background-color: rgba(255, 255, 255, 0.5); /* Add a semi-transparent background color for better visibility */
}
</style>
