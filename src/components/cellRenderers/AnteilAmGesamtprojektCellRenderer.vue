<template>
  <div v-if="props.params.data instanceof Zwischensumme">
    <div
        v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'">
      <p></p>
    </div>
    <div v-else>
      <p class="text-caption pt-2">{{ anteilGesamtprojekt }}%
        <EintragErklaerenComponent v-if="selectedColumn == ColumnET.GESAMTPROJEKT"
                                   :node="props.params.node"></EintragErklaerenComponent>
      </p>
      <p></p></div>
  </div>
  <div v-else>
    <p>{{ anteilGesamtprojekt }}%<EintragErklaerenComponent v-if="selectedColumn == ColumnET.GESAMTPROJEKT"
                                                            :node="props.params.node"></EintragErklaerenComponent></p>
  </div>
</template>

<script lang="ts" setup>
import {Zwischensumme} from "@/models/Zwischensumme";
import {computed} from "vue";
import {useProjektStore} from "@/stores/projekt";
import {ColumnET} from "@/enums/ColumnET";
import EintragErklaerenComponent from "@/components/EintragErklaerenComponent.vue";

const projektStore = useProjektStore();
const props = defineProps(['params']);
const selectedColumn = computed(() => {
  const focusedCell = props.params.api.getFocusedCell()
  if (focusedCell != null) return focusedCell.column.getColId();
  else return ""
})
const anteilGesamtprojekt = computed(() => Number(props.params.data.anteilGesamtprojekt).toLocaleString('de',{ minimumFractionDigits: projektStore.nachkommastellen, maximumFractionDigits: projektStore.nachkommastellen }));

</script>