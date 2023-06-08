<template>
  <v-text-field id="textfield" v-model="newBucketName" autofocus @keydown="editBucket"></v-text-field>
</template>

<script lang="ts" setup>
import {ref} from "vue";

const newBucketName = ref('')

function editBucket(e) {
  if(e.key=='Enter')
  document.getElementById("textfield")!.blur()
}

</script>

