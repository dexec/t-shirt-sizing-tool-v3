<template>
  <div style="height: 100%;overflow: hidden; ">
    <ag-grid-vue
      :animateRows="false"
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :rowData="rowData"
      :stopEditingWhenCellsLoseFocus="true"
      :suppressMovableColumns="true"
      :suppresClickEdit="true"
      class="ag-theme-alpine"
      rowSelection="single"
      style="width: 100%; height: 100%;"
      @contextmenu="rightClickOnCell"
      @cell-value-changed="onCellValueChanged"
      @cell-clicked="onCellClicked"
      @cell-key-down="onCellKeyPress"
      @cell-double-clicked="onCellDoubleClicked"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
  </div>
  <context-menu ref="contextMenuRef" :providedFunctionsProp="[...providedFunctions]"></context-menu>
</template>
<script lang="ts" setup>
import BezeichnungCellRenderer from "@/components/cellRenderers/BezeichnungCellRenderer.vue";
import AufwandRelativCellRenderer from "@/components/cellRenderers/AufwandRelativCellRenderer.vue";
import AufwandAbsolutCellRenderer from "@/components/cellRenderers/AufwandAbsolutCellRenderer.vue";
import AnteilAnZwischensummeCellRenderer from "@/components/cellRenderers/AnteilAnZwischensummeCellRenderer.vue";
import AnteilAmGesamtprojektCellRenderer from "@/components/cellRenderers/AnteilAmGesamtprojektCellRenderer.vue";
import { AgGridVue } from "ag-grid-vue3";
import {nextTick, provide, reactive, ref, watch} from "vue";
import type { ColDef } from "ag-grid-community";
import { Column, GridApi } from "ag-grid-community";
import { useEintraegeStore } from "@/stores/eintraege";
import ContextMenu from "@/components/ContextMenu.vue";
import { Eintrag } from "@/models/Eintrag";
import { Zwischensumme } from "@/models/Zwischensumme";
import { SummeET } from "@/enums/SummeET";
import { ColumnET } from "@/enums/ColumnET";
import { useProjektStore } from "@/stores/projekt";
import {useProjektkalkulationStore} from "@/stores/projektkalkulation";
document.addEventListener('keydown', (e) => {
  if((e.key ==="ArrowUp" || e.key === "ArrowDown") && e.ctrlKey) {
    e.preventDefault();
  }
})
const projektkalkulationStore = useProjektkalkulationStore();
watch(() => projektkalkulationStore.colorCells, (val) => {
  if(val) colorCellsAndExplain();
  else clearColorsAndErklaerungen();
})
provide("eintragErstellen", eintragErstellen);
provide("eintragEntfernen", eintragEntfernen);
provide("zwischensummeErstellen", zwischensummeErstellen);
provide("moveZeileUp", moveZeileUp);
provide("moveZeileDown", moveZeileDown);
const providedFunctions = ref([
  { functionName: "eintragErstellen", functionLabel: "Neuen Eintrag erstellen" },
  { functionName: "eintragEntfernen", functionLabel: "Eintrag entfernen" },
  { functionName: "zwischensummeErstellen", functionLabel: "Neue Zwischensumme erstellen" },
  { functionName: "moveZeileUp", functionLabel: "Eintrag eine Zeile nach oben verschieben", icon: "mdi-arrow-up" },
  { functionName: "moveZeileDown", functionLabel: "Eintrag eine Zeile nach unten verschieben", icon: "mdi-arrow-down" },
]);
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);
const eintragErklaeren = ref(false);

function rightClickOnCell(e: any) {
  gridApi.value!.refreshCells({force:true})
  const focusedCell = gridApi.value!.getFocusedCell();
  if (focusedCell != null) {
    const focusedRowIndex = focusedCell.rowIndex;
    gridApi.value!.getDisplayedRowAtIndex(focusedRowIndex)!.setSelected(true);
  }
  contextMenuRef.value!.showMenu(e);
}

const gridApi = ref<GridApi>();

function onGridReady(params: any) {
  gridApi.value = params.api;
  refreshTable(gridApi.value!.getColumns()![0].getColId(), 0);
}

const columnDefs: ColDef[] = [
  {
    field: "bezeichnung",
    headerName: "Bezeichnung",
    cellRenderer: BezeichnungCellRenderer,
    editable: false
  },
  {
    field: "aufwandRelativ",
    headerName: "Aufwand in %",
    cellRenderer: AufwandRelativCellRenderer,
    cellStyle: {},
    valueSetter: (params: any): any => {
      const newValue = params.newValue.replace(",", ".");
      if (!isNaN(newValue)) {
        eintraegeStore.updateAufwandRelativ(params.node.rowIndex, +newValue);
      } else params.data.aufwandRelativ = params.oldValue;
    },
    editable: false
  },
  {
    field: "aufwandAbsolut",
    headerName: "Aufwand in PT",
    cellRenderer: AufwandAbsolutCellRenderer,
    cellStyle: {},
    valueSetter: (params: any) => {
      const newValue = params.newValue.replace(",", ".");
      if (!isNaN(newValue)) eintraegeStore.updateAufwandAbsolut(params.node.rowIndex, +newValue);
      else params.data.aufwandAbsolut = params.oldValue;
      //gridApi.value!.refreshCells({ force: true });
    },
    editable: false
  },
  {
    field: "anteilZwischensumme",
    headerName: "Anteil an nächster Zwischensumme",
    cellRenderer: AnteilAnZwischensummeCellRenderer,
    cellStyle: {},
    editable: false
  },
  {
    field: "anteilGesamtprojekt",
    headerName: "Anteil am Gesamtprojekt",
    cellRenderer: AnteilAmGesamtprojektCellRenderer,
    cellStyle: {},
    editable: false
  }];
const defaultColDef = reactive(
  {
    suppressKeyboardEvent: (params: any) => {
      let key = params.event.key;
      /*if(key==="ArrowDown" && params.event.ctrlKey) console.log("event")
      return key==="ArrowDown" && params.event.ctrlKey;*/
      return (params.event.ctrlKey || params.event.shiftKey) && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Delete", "Enter", "F2"].includes(key) || ["Delete", "Enter", "F2", "Escape"].includes(key);
    },
    sortable: false,
    flex: 1
  }
);
const projektStore = useProjektStore();
const eintraegeStore = useEintraegeStore();
eintraegeStore.berechne();
const rowData = eintraegeStore.eintraege;

function onCellClicked(e: any) {
  if (projektkalkulationStore.currentSelectedRow == e.rowIndex && projektkalkulationStore.currentSelectedColumn == e.column.colId) return null;
  columnDefs.forEach(column => column.editable = false);
  gridApi.value!.setGridOption("columnDefs", columnDefs);
  projektkalkulationStore.currentSelectedColumn = e.column.colId;
  projektkalkulationStore.currentSelectedRow = e.rowIndex;
}

function onCellDoubleClicked(e: any) {
  columnDefs.forEach(column => column.editable = false);
  gridApi.value!.setGridOption("columnDefs", columnDefs);
  if (gridApi.value!.getEditingCells().length === 0 && ([ColumnET.BEZEICHNUNG, ColumnET.AUFSCHLAG, ColumnET.AUFWAND].includes(e.colDef.field) && !Object.values(SummeET).includes(e.data.bezeichnung))) {
    startEditingCell(e, e.column.colId);
  }
}

function clearColorsAndErklaerungen() {
  eintragErklaeren.value = false;
  columnDefs.forEach(column => {
    column.editable = false;
    column.cellStyle = {};
  });
  gridApi.value!.setGridOption("columnDefs", columnDefs);
  //TODO Tooltip scroll flackert die Anwendung
  gridApi.value!.redrawRows();

}

function colorCellsAndExplain() {
  const focusedCell = gridApi.value!.getFocusedCell();
  if (focusedCell == null) return;
  const column = focusedCell.column.getColId();
  const rowIndex = focusedCell.rowIndex;
  if (gridApi.value!.getEditingCells()[0]?.rowIndex == rowIndex) return;
  clearColorsAndErklaerungen();
  eintragErklaeren.value = true;
  colorCells(column, rowIndex);
  erklaerungenErstellen(column, rowIndex);
  if (rowIndex != undefined && column != undefined) {
    gridApi.value!.getRowNode(rowIndex + "")!.setSelected(true);
    gridApi.value!.setFocusedCell(rowIndex, column);
  }
}

function erklaerungenErstellen(column: string, rowIndex: number) {
  const bezeichnung = gridApi.value!.getRowNode(rowIndex + "")?.data.bezeichnung;
  switch (column) {
    case ColumnET.AUFSCHLAG: {
      erklaereAufschlag(bezeichnung, rowIndex);
      break;
    }
    case ColumnET.AUFWAND : {
      erklaereAufwand(bezeichnung, rowIndex);
      break;
    }
    case ColumnET.ZWISCHENSUMME:
      erklaereAnteilAnZwischensumme(bezeichnung, rowIndex);
      break;
    case ColumnET.GESAMTPROJEKT:
      erklaereAnteilAnGesamtprojekt(bezeichnung, rowIndex);
      break;
  }
}

function erklaereAufschlag(bezeichnung: string, rowIndex: number) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME: {
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      const vorigerAbschnittEintraege: Eintrag[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(rowData[i] as Eintrag);
      }
      projektkalkulationStore.erklaerungsText = "Der Aufschlag der Zwischensumme ist die Summe aller Aufschläge des vorigen Abschnitts.";
      for (let i = vorigerAbschnittEintraege.length - 1; i >= 1; i--) {
        let aufschlag;
        if (vorigerAbschnittEintraege[i].isAufwandRelativBase) {
          aufschlag = vorigerAbschnittEintraege[i].aufwandRelativ;
        } else aufschlag = vorigerAbschnittEintraege[i].aufwandRelativ.toFixed(projektStore.nachkommastellen);
        projektkalkulationStore.erklaerungsRechnung += aufschlag + "% + ";
      }
      let startaufschlag;
      if (vorigerAbschnittEintraege[0].isAufwandRelativBase) {
        startaufschlag = vorigerAbschnittEintraege[0].aufwandRelativ;
      } else startaufschlag = vorigerAbschnittEintraege[0].aufwandRelativ.toFixed(projektStore.nachkommastellen);
      projektkalkulationStore.erklaerungsRechnung += startaufschlag + "%";
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt <span style=color:lightgreen>${projektkalkulationStore.erklaerungsRechnung}</span> = <span style=color:lightblue>${aktuellerEintrag.vorigerAbschnittAufwandRelativ.toFixed(projektStore.nachkommastellen)}%</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${projektkalkulationStore.erklaerungsRechnung}</span> = <span style=color:lightblue>${aktuellerEintrag.vorigerAbschnittAufwandRelativ.toFixed(projektStore.nachkommastellen)}%</span>`;
      break;
    }
    default : {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      projektkalkulationStore.erklaerungsText = "Der Aufschlag errechnet sich durch das Dividieren des Aufwands durch die letzte Zwischensumme.";
      let aufwand;
      let aufschlag;
      const Zwischensumme = aktuellerEintrag.basisZwischensumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen);
      if (aktuellerEintrag.isAufwandRelativBase) {
        aufwand = aktuellerEintrag.aufwandAbsolut.toFixed(projektStore.nachkommastellen);
        aufschlag = aktuellerEintrag.aufwandRelativ;
      } else {
        aufwand = aktuellerEintrag.aufwandAbsolut;
        aufschlag = aktuellerEintrag.aufwandRelativ.toFixed(projektStore.nachkommastellen);
      }
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt <span style=color:lightgreen>${aufwand}</span> / <span style=color:orange> ${Zwischensumme}</span> = <span style=color:lightblue>${aufschlag}%</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${aufwand}</span> / <span style=color:orange> ${Zwischensumme}</span> = <span style=color:lightblue>${aufschlag}%</span>`;
      break;
    }
  }
}

function erklaereAufwand(bezeichnung: string, rowIndex: number) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME: {
      projektkalkulationStore.erklaerungsText = "Das ist die Startsumme, die sich aus der durschnittlichen Summe aller Pakete ergibt.";
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt hier <span style=color:orange>${(rowData[0] as Zwischensumme).zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span>`;
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      const vorigerAbschnittEintraege: Eintrag[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(rowData[i] as Eintrag);
      }
      projektkalkulationStore.erklaerungsText = "Der Aufwand der Zwischensumme ist zweigeteilt. Der obere Wert ergibt sich aus der Summe aller Aufwände des vorigen Abschnitts. ";
      projektkalkulationStore.erklaerungsTextZusatz = "Der untere Wert ergibt sich aus der Summe des oberen Wertes und der Startsumme.";
      for (let i = vorigerAbschnittEintraege.length - 1; i >= 1; i--) {
        let aufwand;
        if (vorigerAbschnittEintraege[i].isAufwandRelativBase) {
          aufwand = vorigerAbschnittEintraege[i].aufwandAbsolut.toFixed(projektStore.nachkommastellen);
        } else aufwand = vorigerAbschnittEintraege[i].aufwandAbsolut;
        projektkalkulationStore.erklaerungsRechnung += "<span style=color:lightgreen>" + aufwand + " +</span> ";
      }
      let startaufwand;
      if (vorigerAbschnittEintraege[0].isAufwandRelativBase) {
        startaufwand = vorigerAbschnittEintraege[0].aufwandAbsolut.toFixed(projektStore.nachkommastellen);
      } else startaufwand = vorigerAbschnittEintraege[0].aufwandAbsolut;
      projektkalkulationStore.erklaerungsRechnung += +startaufwand;
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt für den oberen Wert <span style=color:lightgreen>${projektkalkulationStore.erklaerungsRechnung}</span> = <span style=color:lightblue>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${projektkalkulationStore.erklaerungsRechnung}</span> = <span style=color:lightblue>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span>`;
      //projektkalkulationStore.erklaerungsRechnungZusatz = `Für den unteren Wert ergibt das <span style=color:lightblue>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> + <span style=color:orange>${vorigerAbschnittEintraege[0].basisZwischensumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span>`;
      projektkalkulationStore.erklaerungsRechnungZusatz = `<span style=color:lightblue>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> + <span style=color:orange>${vorigerAbschnittEintraege[0].basisZwischensumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span>`;
      break;
    }
    case SummeET.ENDSUMME: {
      const endsumme = gridApi.value!.getRowNode(rowData.length - 1 + "")!.data as Zwischensumme;
      const alleEintraege: number[] = [];
      for (let i = rowIndex - 1; i >= 1; i--) {
        if (rowData[i] instanceof Eintrag) {
          alleEintraege.push((rowData[i] as Eintrag).aufwandAbsolut);
        }
      }
      projektkalkulationStore.erklaerungsRechnung += gridApi.value!.getRowNode("0")!.data.zwischensummeAufwand;
      for (let i = alleEintraege.length - 1; i >= 0; i--) {
        projektkalkulationStore.erklaerungsRechnung += " + " + alleEintraege[i].toFixed(projektStore.nachkommastellen);
      }
      projektkalkulationStore.erklaerungsText = "Die Endsumme ergibt sich aus der Summe aller voriger Aufwände und der Startsumme.";
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt <span style=color:lightgreen>${projektkalkulationStore.erklaerungsRechnung}</span> = <span style=color:lightblue>${endsumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${projektkalkulationStore.erklaerungsRechnung}</span> = <span style=color:lightblue>${endsumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span>`;
      break;
    }
    default : {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      const Zwischensumme = aktuellerEintrag.basisZwischensumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen);
      projektkalkulationStore.erklaerungsText = "Der Aufwand errechnet sich durch das Multiplizieren des Aufschlags mit der Zwischensumme.";
      let aufwand;
      let aufschlag;
      if (aktuellerEintrag.isAufwandRelativBase) {
        aufwand = aktuellerEintrag.aufwandAbsolut.toFixed(projektStore.nachkommastellen);
        aufschlag = aktuellerEintrag.aufwandRelativ;
      } else {
        aufwand = aktuellerEintrag.aufwandAbsolut;
        aufschlag = aktuellerEintrag.aufwandRelativ.toFixed(projektStore.nachkommastellen);
      }
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt <span style=color:lightgreen>${aufschlag}%</span> * <span style=color:orange>${Zwischensumme}</span> = <span style=color:lightblue>${aufwand}</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${aufschlag}%</span> * <span style=color:orange>${Zwischensumme}</span> = <span style=color:lightblue>${aufwand}</span>`;
      break;
    }
  }
}

function erklaereAnteilAnZwischensumme(bezeichnung: string, rowIndex: number) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME : {
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      projektkalkulationStore.erklaerungsText = "Der Anteil an nächster Zwischensumme bedeutet hier, wie viel Aufwand in Prozent der vorige Abschnitt für die aktuelle Zwischensumme ausmacht.";
      //projektkalkulationStore.erklaerungsRechnung = `Daraus ergibt sich <span style=color:lightgreen>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${aktuellerEintrag.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilZwischensumme.toFixed(projektStore.nachkommastellen)}%</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${aktuellerEintrag.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilZwischensumme.toFixed(projektStore.nachkommastellen)}%</span>`;
      break;
    }
    default: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      let naechsteZwischensumme = (gridApi.value!.getRowNode(rowData.length - 1 + "")!.data as Zwischensumme).zwischensummeAufwand;
      for (let i = rowIndex; i < rowData.length; i++) {
        if (rowData[i] instanceof Zwischensumme) {
          naechsteZwischensumme = gridApi.value!.getRowNode(i + "")!.data.zwischensummeAufwand;
          break;
        }
      }
      projektkalkulationStore.erklaerungsText = "Der Anteil an nächster Zwischensumme zeigt, wie viel Aufwand in Prozent der aktuelle Eintrag für die nächste Zwischensumme ausmacht.";
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt <span style=color:lightgreen>${aktuellerEintrag.aufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${naechsteZwischensumme.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilZwischensumme.toFixed(projektStore.nachkommastellen)}%</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${aktuellerEintrag.aufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${naechsteZwischensumme.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilZwischensumme.toFixed(projektStore.nachkommastellen)}%</span>`;
    }
  }
}

function erklaereAnteilAnGesamtprojekt(bezeichnung: string, rowIndex: number) {
  const endsumme = gridApi.value!.getRowNode(rowData.length - 1 + "")!.data as Zwischensumme;
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME: {
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      projektkalkulationStore.erklaerungsText = "Der Anteil am Gesamtporjekt zeigt, wie viel Aufwand in Prozent der vorige Abschnitt für die Endsumme ausmacht.";
      //projektkalkulationStore.erklaerungsRechnung = `Daraus ergibt sich <span style=color:lightgreen>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${endsumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilGesamtprojekt.toFixed(projektStore.nachkommastellen)}%</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${aktuellerEintrag.vorigerAbschnittAufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${endsumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilGesamtprojekt.toFixed(projektStore.nachkommastellen)}%</span>`;
      break;
    }
    default: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      projektkalkulationStore.erklaerungsText = "Der Anteil am Gesamtprojekt zeigt, wie viel Aufwand in Prozent der aktuelle Eintrag für das Gesamtprojekt ausmacht.";
      //projektkalkulationStore.erklaerungsRechnung = `Das ergibt <span style=color:lightgreen>${aktuellerEintrag.aufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${endsumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilGesamtprojekt.toFixed(projektStore.nachkommastellen)}%</span>`;
      projektkalkulationStore.erklaerungsRechnung = `<span style=color:lightgreen>${aktuellerEintrag.aufwandAbsolut.toFixed(projektStore.nachkommastellen)}</span> / <span style=color:orange>${endsumme.zwischensummeAufwand.toFixed(projektStore.nachkommastellen)}</span> = <span style=color:lightblue>${aktuellerEintrag.anteilGesamtprojekt.toFixed(projektStore.nachkommastellen)}%</span>`;
    }
  }
}

function colorCells(column: string, rowIndex: number) {
  switch (column) {
    case ColumnET.AUFSCHLAG:
    case ColumnET.AUFWAND : {
      colorAufschlagUndAufwand(rowIndex, column);
      break;
    }
    case ColumnET.ZWISCHENSUMME: {
      colorZwischensumme(rowIndex);
      break;
    }
    case ColumnET.GESAMTPROJEKT: {
      colorGesamtprojekt(rowIndex);
      break;
    }
  }
}

function colorAufschlagUndAufwand(rowIndex: number, column: string) {
  const bezeichnung = gridApi.value!.getRowNode(rowIndex + "")?.data.bezeichnung;
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
      if (column == ColumnET.AUFWAND) {
        columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
          if (params.rowIndex == 0) return { "outline-offset": "-3px", "outline": "3px solid orange", color: "black" };
        };
        gridApi.value!.setGridOption("columnDefs", columnDefs);
      }
      break;
    case SummeET.ENDSUMME: {
      if (column == ColumnET.AUFWAND) {
        const alleEintraege: number[] = [0];
        for (let i = 1; i < rowData.length - 1; i++) {
          if (rowData[i] instanceof Eintrag) {
            alleEintraege.push(i);
          }
          columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
            if (alleEintraege.includes(params.rowIndex)) return {
              "outline-offset": "-3px", "outline": "3px solid green",
              color: "black"
            };
            if (params.rowIndex == rowData.length - 1) return { "outline-offset": "-3px", "outline": "3px solid darkblue", color: "black" };
          };
          gridApi.value!.setGridOption("columnDefs", columnDefs);
        }
      }
      break;
    }
    case SummeET.ZWISCHENSUMME : {
      const vorigerAbschnittEintraege: number[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(i);
      }
      columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == column)!.cellStyle = (params: any): any => {
        if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid darkblue", color: "black" };
        if (vorigerAbschnittEintraege.includes(params.rowIndex)) return {
          "outline-offset": "-3px", "outline": "3px solid green",
          color: "black"
        };
        if (params.rowIndex == vorigerAbschnittEintraege[vorigerAbschnittEintraege.length - 1] - 1 && column == ColumnET.AUFWAND) return {
          "outline-offset": "-3px", "outline": "3px solid orange",
          color: "black"
        };
        return { color: "black" };
      };
      gridApi.value!.setGridOption("columnDefs", columnDefs);
      break;
    }
    default: {
      const columnNeighbor = column == ColumnET.AUFSCHLAG ? ColumnET.AUFWAND : ColumnET.AUFSCHLAG;
      for (let i = rowIndex; i >= 0; i--) {
        if ([SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung)) {
          columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == column)!.cellStyle = (params: any): any => {
            if (params.rowIndex == i && column == ColumnET.AUFWAND) return {
              "outline-offset": "-3px", "outline": "3px solid orange",
              color: "black"
            };
            if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid darkblue", color: "black" };
            return { color: "black" };
          };
          columnDefs.find(column => column.field == columnNeighbor)!.cellStyle = (params: any): any => {
            if (params.rowIndex == i && column == ColumnET.AUFSCHLAG) return {
              "outline-offset": "-3px", "outline": "3px solid orange",
              color: "black"
            };
            if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid green", color: "black" };
            return { color: "black" };
          };
          gridApi.value!.setGridOption("columnDefs", columnDefs);
          break;
        }
      }
    }
  }
}

function colorZwischensumme(rowIndex: number) {
  const bezeichnung = gridApi.value!.getRowNode(rowIndex + "")?.data.bezeichnung;
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME: {
      break;
    }
    case SummeET.ZWISCHENSUMME : {
      const vorigerAbschnittEintraege: number[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(i);
      }
      columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any): any => {
        if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid orange", color: "black" };
        if (vorigerAbschnittEintraege.includes(params.rowIndex)) return { "outline-offset": "-3px", "outline": "3px solid green", color: "black" };
        return { color: "black" };
      };
      columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.ZWISCHENSUMME)!.cellStyle = (params: any): any => {
        if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid darkblue", color: "black" };
        return { color: "black" };
      };
      gridApi.value!.setGridOption("columnDefs", columnDefs);
      break;
    }
    default: {
      for (let i = rowIndex; i < rowData.length; i++) {
        if ([SummeET.ZWISCHENSUMME as string, SummeET.ENDSUMME as string].includes(rowData[i].bezeichnung)) {
          columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any): any => {
            if (params.rowIndex == i) return { "outline-offset": "-3px", "outline": "3px solid orange", color: "black" };
            if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid green", color: "black" };
            return { color: "black" };
          };
          columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.ZWISCHENSUMME)!.cellStyle = (params: any): any => {
            if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid darkblue", color: "black" };
            return { color: "black" };
          };
          gridApi.value!.setGridOption("columnDefs", columnDefs);
          break;
        }
      }
    }
  }
}

function colorGesamtprojekt(rowIndex: number) {
  const bezeichnung = gridApi.value!.getRowNode(rowIndex + "")?.data.bezeichnung;
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME: {
      break;
    }
    case SummeET.ZWISCHENSUMME:
    default: {
      columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any): any => {
        if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid green", color: "black" };
        if (params.rowIndex == rowData.length - 1) return { "outline-offset": "-3px", "outline": "3px solid orange", color: "black" };
        return { color: "black" };
      };
      columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.GESAMTPROJEKT)!.cellStyle = (params: any): any => {
        if (params.rowIndex == rowIndex) return { "outline-offset": "-3px", "outline": "3px solid darkblue", color: "black" };
        return { color: "black" };
      };
      gridApi.value!.setGridOption("columnDefs", columnDefs);
    }
  }
}

function onCellValueChanged(e: any) {
  gridApi.value!.forEachNode(function(node) {
    if (node.data.bezeichnung === SummeET.ZWISCHENSUMME) node.setRowHeight(80);
  });
  gridApi.value!.onRowHeightChanged();
  //nextTick(() => colorCellsAndExplain(e.column.getColId(), e.rowIndex));
}

function onCellKeyPress(e: any) {
  if (e.event) {
    const key = e.event.key;
    const ctrl = e.event.ctrlKey;
    const shift = e.event.shiftKey;
    const colKey = e.column.colId;

    if (gridApi.value!.getEditingCells().length === 0) {
      switch (key) {
        case "ArrowDown": {
          clearColorsAndErklaerungen();
          const focusedCell = gridApi.value!.getFocusedCell()!;
          const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
          projektkalkulationStore.currentSelectedColumn = colKey;
          projektkalkulationStore.currentSelectedRow = focusedCell.rowIndex;
          if (e.data.bezeichnung == SummeET.STARTSUMME && (shift || ctrl)) {
            refreshTable(e.column, 1);
          } else if (shift || ctrl) {
            nextTick(() => moveZeileDown());
          } else {
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
          }
          break;
        }
        case "ArrowUp": {
          clearColorsAndErklaerungen();
          const focusedCell = gridApi.value!.getFocusedCell()!;
          const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
          projektkalkulationStore.currentSelectedColumn = colKey;
          projektkalkulationStore.currentSelectedRow = focusedCell.rowIndex;
          if (e.data.bezeichnung == SummeET.ENDSUMME && (shift || ctrl)) {
            refreshTable(e.column, rowData.length - 2);
          } else if (shift || ctrl) {
            nextTick(() => moveZeileUp());
          } else {
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
          }
          break;
        }
        case "ArrowRight":
        case "ArrowLeft": {
          clearColorsAndErklaerungen();
          const focusedCell = gridApi.value!.getFocusedCell()!;
          const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
          projektkalkulationStore.currentSelectedColumn = focusedCell.column.getId();
          projektkalkulationStore.currentSelectedRow = focusedCell.rowIndex;
          if (selectedPaket) {
            selectedPaket.setSelected(true);
          }
          break;
        }
        case "Delete": {
          if (shift || ctrl) {
            nextTick(() => eintragEntfernen());
          } else {
            if (![ColumnET.ZWISCHENSUMME, ColumnET.GESAMTPROJEKT].includes(colKey) && ![SummeET.ZWISCHENSUMME, SummeET.STARTSUMME, SummeET.ENDSUMME].includes(e.data.bezeichnung)) {
              if (colKey == ColumnET.AUFWAND) {
                eintraegeStore.updateAufwandAbsolut(e.rowIndex, 0);
              } else if (colKey == ColumnET.AUFSCHLAG) {
                eintraegeStore.updateAufwandRelativ(e.rowIndex, 0);
              }
              refreshTable(colKey, e.rowIndex);
            }
          }
          break;
        }
        case "+" : {
          if (!ctrl)
            nextTick(() => eintragErstellen());
          break;
        }
        case "*": {
          if (!ctrl)
            nextTick(() => zwischensummeErstellen());
          break;
        }
        case "F2": {
          nextTick(() => startEditingCell(e, colKey));
          break;
        }
      }
    } else {
      switch (key) {
        case "Enter": {
          stopEiditingAndSetFocus(false, e.rowIndex, colKey);
          break;
        }
        case "Escape": {
          stopEiditingAndSetFocus(true, e.rowIndex, colKey);
          break;
        }
      }
    }

  }
}

function startEditingCell(e: any, colKey: string) {
  if ([ColumnET.BEZEICHNUNG, ColumnET.AUFSCHLAG, ColumnET.AUFWAND].includes(colKey as ColumnET) && !Object.values(SummeET).includes(e.data.bezeichnung)) {

    if (colKey as ColumnET == ColumnET.AUFSCHLAG && !e.data.isAufwandRelativBase) {
      e.data.aufwandRelativ = parseFloat(e.data.aufwandRelativ.toFixed(projektStore.nachkommastellen));
    } else if (colKey as ColumnET == ColumnET.AUFWAND && e.data.isAufwandRelativBase) {
      e.data.aufwandAbsolut = parseFloat(e.data.aufwandAbsolut.toFixed(projektStore.nachkommastellen));
    }
    columnDefs.find(column => column.field === colKey)!.editable = true;
    columnDefs.find(columnOfColumnDefs => columnOfColumnDefs.field == colKey)!.cellStyle = (params: any): any => {
      if (params.rowIndex == e.rowIndex) return { color: "black" };
    };
    gridApi.value!.setGridOption("columnDefs", columnDefs);
    nextTick(() => gridApi.value!.startEditingCell({
      rowIndex: e.rowIndex,
      colKey: e.column
    }));
  }
}

function onCellEditingStopped(e: any) {
  columnDefs.forEach(column => column.editable = false);
  gridApi.value!.setGridOption("columnDefs", columnDefs);
}

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  gridApi.value!.stopEditing(cancel);
  nextTick(() => eintraegeStore.berechne());
  columnDefs.forEach(column => column.editable = false);
  gridApi.value!.setGridOption("columnDefs", columnDefs);
  gridApi.value!.setFocusedCell(rowIndex, colKey);
  //refreshTable(colKey, rowIndex);
}

function eintragErstellen() {
  if (gridApi.value!.getSelectedRows()[0] && gridApi.value!.getSelectedRows()[0].bezeichnung !== SummeET.ENDSUMME) {
    const rowIndexSelectedRow = rowData.indexOf(gridApi.value!.getSelectedRows()[0]);
    eintraegeStore.addNewEintrag(rowIndexSelectedRow);
    const focusedCell = gridApi.value!.getFocusedCell();
    let colKey = "";
    if (focusedCell != null) {
      colKey = focusedCell.column.getColId();
    } else colKey = gridApi.value!.getColumns()![0].getColId();
    refreshTable(colKey, rowIndexSelectedRow + 1);
  }
}

function zwischensummeErstellen() {
  const focusedCell = gridApi.value!.getFocusedCell();
  if (gridApi.value!.getSelectedRows()[0] != null && focusedCell != null) {
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    const bezeichnungSelectedRowUnder = rowData[focusedCell.rowIndex + 1].bezeichnung;
    if (!Object.values(SummeET).includes(bezeichnungSelectedRow) && ![SummeET.ZWISCHENSUMME as string, SummeET.STARTSUMME as string].includes(bezeichnungSelectedRowUnder)) {
      eintraegeStore.addNewZwischensumme(focusedCell.rowIndex);
      refreshTable(focusedCell.column, focusedCell.rowIndex + 1);
    }
  }
}

function eintragEntfernen() {
  const focusedCell = gridApi.value!.getFocusedCell();
  if (gridApi.value!.getSelectedRows()[0] != null && focusedCell != null) {
    const focusedRowIndex = focusedCell.rowIndex;
    const focusedRowColKey = focusedCell.column;
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    if (![SummeET.STARTSUMME, SummeET.ENDSUMME].includes(bezeichnungSelectedRow)) {
      eintraegeStore.deleteEintrag(focusedRowIndex);
      if (gridApi.value!.getRowNode(focusedRowIndex + 1 + "")?.data.bezeichnung == SummeET.ENDSUMME) {
        refreshTable(focusedRowColKey, focusedRowIndex - 1);
      } else {
        refreshTable(focusedRowColKey, focusedRowIndex);
      }
    }
  }
}

function moveZeileUp() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    if (![SummeET.STARTSUMME, SummeET.ENDSUMME].includes(bezeichnungSelectedRow)) {
      const focusedCell = gridApi.value!.getFocusedCell();
      const focusedRowIndex = focusedCell!.rowIndex;
      const focusedRowColKey = focusedCell!.column;
      eintraegeStore.moveUp(gridApi.value!.getFocusedCell()!.rowIndex);
      refreshTable(focusedRowColKey, focusedRowIndex - 1);
    }
  }
}

function moveZeileDown() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    const focusedCell = gridApi.value!.getFocusedCell();
    const focusedRowIndex = focusedCell!.rowIndex;
    const bezeichnungSelectedRowUnder = rowData[focusedCell!.rowIndex + 1].bezeichnung;
    if (bezeichnungSelectedRowUnder !== SummeET.ENDSUMME && ![SummeET.STARTSUMME, SummeET.ENDSUMME].includes(bezeichnungSelectedRow)) {
      const focusedRowColKey = focusedCell!.column;
      eintraegeStore.moveDown(focusedRowIndex);
      refreshTable(focusedRowColKey, focusedRowIndex + 1);
    }
  }
}
//TODO Automatisches Scrolling nach oben verhindern
function refreshTable(colKey?: Column | string, rowIndex?: number) {
  nextTick(() => {
    gridApi.value!.setGridOption("rowData", eintraegeStore.eintraege);
    gridApi.value!.forEachNode(function(node) {
      if (node.data.bezeichnung === SummeET.ZWISCHENSUMME) node.setRowHeight(80);
    });
    gridApi.value!.onRowHeightChanged();
    columnDefs.forEach(column => column.editable = false);
    gridApi.value!.setGridOption("columnDefs", columnDefs);
    if (rowIndex != undefined && colKey != undefined) {
      gridApi.value!.getRowNode(rowIndex + "")!.setSelected(true);
      gridApi.value!.setFocusedCell(rowIndex, colKey);
    }
    gridApi.value!.refreshCells({ force: true });
    //columnApi.value!.autoSizeColumn("bezeichnung");
  });
}

</script>
<style scoped>

</style>

