<template>
  <!--  <span>
    <span v-if="props.params.data instanceof Zwischensumme">
        <span v-if="props.params.data.bezeichnung==='Startsumme' || props.params.data.bezeichnung==='Endsumme'"
              class="font-weight-bold">{{ zwischensummeAufwand }}
        </span>
      <span v-else>
        <span class="text-caption pt-2" style="display: block">{{ vorigerAbschnittAufwandAbsolut }}
        </span>
        <span class="font-weight-bold">{{ zwischensummeAufwand }}</span>
      </span>
    </span>
      <span v-else>
        {{ aufwandAbsolut }}
        <span v-if="!props.params.data.isAufwandRelativBase">*</span>
      </span>
    <span>
            <EintragErklaerenComponent
              v-if="selectedColumn == ColumnET.AUFWAND && props.params.data.bezeichnung!='Startsumme' && props.params.data.bezeichnung!='Endsumme'"
              :api="props.params.api" :node="props.params.node"></EintragErklaerenComponent>
    </span>
      </span>-->
  <div class="d-flex flex-nowrap fill-height">
    <template v-if="props.params.data instanceof Zwischensumme">
      <template v-if="bezeichnung==='Startsumme' || bezeichnung==='Endsumme'">
        <div class="flex-grow-1">
          <span class="font-weight-bold"> {{ zwischensummeAufwand }} </span>
        </div>
      </template>
      <template v-else>
        <div class="flex-grow-1 pt-3">
          <div class="text-caption">
            {{ vorigerAbschnittAufwandAbsolut }}
          </div>
          <div class="font-weight-bold">
            {{ zwischensummeAufwand }}
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="flex-grow-1">
        <div>
          {{ aufwandAbsolut }}
          <template v-if="!props.params.data.isAufwandRelativBase">
            <v-icon class="ml-3" icon="mdi-pencil"></v-icon>
          </template>
        </div>
      </div>
    </template>
    <div class="align-self-center">
    <EintragErklaerenComponent
      v-if="selectedColumn == ColumnET.AUFWAND && bezeichnung!='Startsumme' && bezeichnung!='Endsumme'"
      :api="props.params.api" :node="props.params.node"></EintragErklaerenComponent>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Zwischensumme } from "@/models/Zwischensumme";
import { computed } from "vue";
import { useKonfigContainer } from "@/stores/konfigContainer";
import EintragErklaerenComponent from "@/components/EintragErklaerenComponent.vue";
import { ColumnET } from "@/enums/ColumnET";

const konfigContainer = useKonfigContainer();
const props = defineProps(["params"]);
const selectedColumn = computed(() => {
  const focusedCell = props.params.api.getFocusedCell();
  if (focusedCell != null) return focusedCell.column.getColId();
  else return "";
});
const aufwandAbsolut = computed(() => {
  if (props.params.data.isAufwandRelativBase)
    return Number(props.params.data.aufwandAbsolut).toLocaleString("de", {
      minimumFractionDigits: konfigContainer.nachkommastellen,
      maximumFractionDigits: konfigContainer.nachkommastellen
    });
  else return Number(props.params.data.aufwandAbsolut).toLocaleString();
});
const bezeichnung = computed(() => props.params.data.bezeichnung);

const vorigerAbschnittAufwandAbsolut = computed(() => Number(props.params.data.vorigerAbschnittAufwandAbsolut).toLocaleString("de", {
  minimumFractionDigits: konfigContainer.nachkommastellen,
  maximumFractionDigits: konfigContainer.nachkommastellen
}));
const zwischensummeAufwand = computed(() => Number(props.params.data.zwischensummeAufwand).toLocaleString("de", {
  minimumFractionDigits: konfigContainer.nachkommastellen,
  maximumFractionDigits: konfigContainer.nachkommastellen
}));
</script>