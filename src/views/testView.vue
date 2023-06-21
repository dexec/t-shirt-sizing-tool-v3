<template>
  <h1>TestView</h1>
  <p>{{firstName}}, {{lastName}}</p>
</template>

<script setup lang="ts">
defineProps({
  firstName: String,
  lastName: String
})
</script>
