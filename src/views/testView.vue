<template>
  <div @keyup.enter="console.log('entered')">
    <test-comp>

    </test-comp>
  </div>
</template>

<script setup>

import TestComp from "@/components/testComp.vue";
</script>