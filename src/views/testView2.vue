<template>

</template>

<style scoped>

</style>

<script lang="js" setup>
const columnDefs = [
  { field: "athlete" },
  { field: "age" },
  { field: "country" },
  { field: "sport" },
  { field: "year" },
  { field: "date" },
  { field: "gold" },
  { field: "silver" },
  { field: "bronze" },
  { field: "total" },
];
columnDefs.forEach(function (colDef, index) {
  colDef.headerName = "C" + index;
});
</script>