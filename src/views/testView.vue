<template>
  <div>{{ store.getBuckets }}</div>
  <div>{{ paketeStore.$state.paketeAsTreeView }}</div>
</template>

<script setup>
import { useBucketsStore } from '@/stores/bucket'
import {usePaketeStore} from '@/stores/pakete'

const paketeStore = usePaketeStore();
const store = useBucketsStore();
</script>
