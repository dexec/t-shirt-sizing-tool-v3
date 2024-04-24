<template>
<!--  <span>
  <span v-if="props.params.data instanceof Zwischensumme">
    <span v-if="props.params.data.bezeichnung!=='Startsumme' || props.params.data.bezeichnung!=='Endsumme'">
      <span class="text-caption pt-2">{{ anteilZwischensumme }}%
        <EintragErklaerenComponent  v-if="selectedColumn == ColumnET.ZWISCHENSUMME"
                                   :node="props.params.node" :api="props.params.api"></EintragErklaerenComponent>
      </span>
      <p></p>
    </span>
  </span>
  <div v-else>
    <p>{{ anteilZwischensumme }}%
      <EintragErklaerenComponent v-if="selectedColumn == ColumnET.ZWISCHENSUMME"
                                 :node="props.params.node" :api="props.params.api"></EintragErklaerenComponent>
    </p>
  </div>
    </span>-->
  <div class="d-flex flex-nowrap fill-height">
    <template v-if="props.params.data instanceof Zwischensumme">
      <template v-if="bezeichnung!='Startsumme' && bezeichnung!='Endsumme'">
        <div class="flex-grow-1">
          <span class="text-caption">{{ anteilZwischensumme }}%</span>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="flex-grow-1">
        {{anteilZwischensumme}}%
      </div>
    </template>
    <div class="align-self-center">
      <EintragErklaerenComponent v-if="selectedColumn == ColumnET.ZWISCHENSUMME && bezeichnung!='Startsumme' && bezeichnung!='Endsumme'"
                                 :node="props.params.node" :api="props.params.api"></EintragErklaerenComponent>
    </div>
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
const bezeichnung = computed(() => props.params.data.bezeichnung);
</script>