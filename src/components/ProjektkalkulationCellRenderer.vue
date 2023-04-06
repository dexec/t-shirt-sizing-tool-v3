<template>
  <div v-if="params.type==='bezeichnung'">
    <div v-if="params.data.bezeichnung==='ZWISCHENSUMME'">
      <p class="text-caption pt-2">Voriger Abschnitt</p>
      <p class="font-weight-bold">Zwischensumme</p>
    </div>
    <div v-else-if="params.value==='STARTSUMME' || params.value==='ENDSUMME'">
      <p class="font-weight-bold">{{ params.value }}</p>
    </div>
    <div v-else>{{ params.value }}</div>
  </div>
  <div v-else-if="params.type==='aufschlag'">
    <div v-if="params.data.bezeichnung==='ZWISCHENSUMME'">
      <p class="text-caption pt-2">{{ params.data.vorigerAbschnittAufschlag }}%</p>
      <p></p>
    </div>
    <div v-else-if="params.value === null || params.value === 0 || params.value === ''">
      <p></p>
    </div>
    <div v-else>{{ params.value }}%</div>
  </div>
  <div v-else-if="params.type==='aufwand'">
    <div v-if="params.data.bezeichnung==='ZWISCHENSUMME'">
      <p class="text-caption pt-2">{{ params.data.vorigerAbschnittAufwand }}</p>
      <p class="font-weight-bold">{{ params.data.zwischensummeAufwand }}</p>
    </div>
    <div v-else-if="params.value === null || params.value === ''">
      <p></p>
    </div>
    <div v-else>{{ params.value }}</div>
  </div>
  <div v-else-if="params.type==='anteilAnZwischensumme'">
    <div v-if="params.data.bezeichnung==='ZWISCHENSUMME'">
      <div v-if="params.value === null || params.value === 0 || params.value === ''">
        <p></p>
      </div>
      <div v-else>
        <p class="text-caption pt-2">{{ params.value }}%</p>
      </div>
    </div>
    <div v-else-if="params.value === null || params.value === 0 || params.value === ''">
      <p></p>
    </div>
    <div v-else>
      <p>{{ params.value }}%</p>
    </div>
  </div>
  <div v-else-if="params.type==='anteilAmGesamtprojekt'">
    <div v-if="params.data.bezeichnung==='ZWISCHENSUMME'">
      <div v-if="params.value === null || params.value === 0 || params.value === ''">
        <p></p>
      </div>
      <div v-else>
        <p class="text-caption pt-2">{{ params.value }}%</p>
      </div>
    </div>
    <div v-else-if="params.value === null || params.value === 0 || params.value === ''">
      <p></p>
    </div>
    <div v-else>
      <p>{{ params.value }}%</p>
    </div>
  </div>
</template>

<script>

export default {
  name: "ProjektkalkulationCellRenderer",
  setup(props) {
    return {
      params: props.params,
    };
  },
}
</script>