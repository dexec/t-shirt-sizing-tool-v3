<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">

      <p></p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ anteilZwischensumme }}%
        <EintragErklaerenComponent  v-if="selectedColumn == ColumnET.ZWISCHENSUMME"
                                   :node="props.params.node"></EintragErklaerenComponent>
      </p>
      <p></p>
    </div>
  </div>
  <div v-else>
    <p>{{ anteilZwischensumme }}%
      <EintragErklaerenComponent v-if="selectedColumn == ColumnET.ZWISCHENSUMME"
                                 :node="props.params.node"></EintragErklaerenComponent>
    </p>
  </div>
</template>

<script lang="ts" setup>
import {useProjektStore} from "@/stores/projekt";
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {ColumnET} from "@/enums/ColumnET";
import EintragErklaerenComponent from "@/components/EintragErklaerenComponent.vue";

const projektStore = useProjektStore();
const props = defineProps(['params']);
const selectedColumn = computed(() => {
  const focusedCell = props.params.api.getFocusedCell()
  if (focusedCell != null) return focusedCell.column.getColId();
  else return ""
})
const anteilZwischensumme = computed(() => Number(props.params.data.anteilZwischensumme).toLocaleString('de', {
  minimumFractionDigits: projektStore.nachkommastellen,
  maximumFractionDigits: projektStore.nachkommastellen
}));
</script>