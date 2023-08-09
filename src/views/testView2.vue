<template>
   <v-btn @click="myCode">TEST</v-btn>
  <div id="yyy">test</div>
  <div v-html="mv" />
</template>

<script setup>
import { ref } from "vue";

let mv = ref("meinstring");

function myCode()
{
  window.document.title = "hallo welt";
  document.getElementById("yyy").innerHTML = "<b><i>v-html demonstriert, so funktioniert es intern</i></b>";
  mv.value = "<b><i>v-html demonstriert, so funktioniert es intern</i></b>";
}

const string1and2 = ref("");
string1and2.value="string 1" + "\r\nstring 2";

</script>

