<template>
  <div class="d-flex flex-row" style="width: 100%;height: 100%">
    <ag-grid-vue
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :rowData="rowData"
      class="ag-theme-alpine"
      rowSelection="single"
      style="width: 65%;height: 100%"
      @contextmenu="rightClickOnCell"
      @cell-value-changed="onCellValueChanged"
      @cell-clicked="onCellClicked"
      @cell-key-down="onCellKeyPress"
      @cell-double-clicked="onCellDoubleClicked"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
    <div style="width:35%; border: 1px solid black">
      <div v-html="erklaerungsText"></div>
      <div v-if="erklaerungsTextZusatz!=''" v-html="erklaerungsTextZusatz"></div>
      <div v-html="erklaerungsRechnung"></div>
      <div v-if="erklaerungsRechnungZusatz!=''" v-html="erklaerungsRechnungZusatz"></div>
    </div>
  </div>
  <context-menu ref="contextMenuRef" :providedFunctionsProp="[...providedFunctions]"></context-menu>
</template>
<script lang="ts" setup>
import BezeichnungCellRenderer from "@/components/projektkalkulation/BezeichnungCellRenderer.vue";
import AufschlagCellRenderer from "@/components/projektkalkulation/AufwandRelativCellRenderer.vue";
import AufwandCellRenderer from "@/components/projektkalkulation/AufwandAbsolutCellRenderer.vue";
import AnteilAnZwischensummeCellRenderer from "@/components/projektkalkulation/AnteilAnZwischensummeCellRenderer.vue";
import AnteilAmGesamtprojektCellRenderer from "@/components/projektkalkulation/AnteilAmGesamtprojektCellRenderer.vue";
import { AgGridVue } from "ag-grid-vue3";
import { nextTick, provide, reactive, ref } from "vue";
import { Column, ColumnApi, GridApi } from "ag-grid-community";
import { useEintraegeStore } from "@/stores/eintraege";
import ContextMenu from "@/components/ContextMenu.vue";
import { Eintrag } from "@/models/Eintrag";
import { Zwischensumme } from "@/models/Zwischensumme";
import { SummeET } from "@/enums/SummeET";
import { ColumnET } from "@/enums/ColumnET";
import { useProjektStore } from "@/stores/projekt";

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
  { functionName: "moveZeileDown", functionLabel: "Eintrag eine Zeile nach unten verschieben", icon: "mdi-arrow-down" }
]);
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null);

function rightClickOnCell(e: any) {
  const focusedCell = gridApi.value!.getFocusedCell();
  if (focusedCell != null) {
    const focusedRowIndex = focusedCell.rowIndex;
    gridApi.value!.getDisplayedRowAtIndex(focusedRowIndex)!.setSelected(true);
    colorCellsAndExplain(focusedCell.column.getColId(), focusedRowIndex);
  }
  contextMenuRef.value!.showMenu(e);
}

const gridApi = ref<GridApi>();
const columnApi = ref<ColumnApi>();

function onGridReady(params: any) {
  columnApi.value = params.columnApi;
  gridApi.value = params.api;
  refreshTable(columnApi.value!.getColumns()![0].getColId(), 0);
}

const columnDefs = ref([
  {
    field: "bezeichnung",
    headerName: "Bezeichnung",
    cellRenderer: BezeichnungCellRenderer,
    editable: false
  },
  {
    field: "aufwandRelativ",
    headerName: "Aufschlag",
    cellRenderer: AufschlagCellRenderer,
    cellStyle: {},
    valueSetter: (params: any) => {
      const newValue = params.newValue.replace(",", ".");
      if (!isNaN(newValue)) {
        eintraegeStore.updateAufschlag(params.node.rowIndex, +newValue);
      } else params.data.aufwandRelativ = params.oldValue;
      gridApi.value!.refreshCells({ force: true });
    },
    editable: false
  },
  {
    field: "aufwandAbsolut",
    headerName: "Aufwand",
    cellRenderer: AufwandCellRenderer,
    cellStyle: {},
    valueSetter: (params: any) => {
      const newValue = params.newValue.replace(",", ".");
      if (!isNaN(newValue)) eintraegeStore.updateAufwand(params.node.rowIndex, +newValue);
      else params.data.aufwandAbsolut = params.oldValue;
      gridApi.value!.refreshCells({ force: true });
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
  }]);
const defaultColDef = reactive(
  {
    suppressKeyboardEvent: (params: any) => {
      let key = params.event.key;
      return (params.event.ctrlKey || params.event.shiftKey) && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Delete", "Enter", "F2"].includes(key) || ["Delete", "Enter", "F2", "Escape"].includes(key);
    }
  }
);
const projectStore = useProjektStore();
const eintraegeStore = useEintraegeStore();
eintraegeStore.berechne();
const rowData = eintraegeStore.eintraege;

function onCellDoubleClicked(e: any) {
  Object.values(SummeET);
  if (gridApi.value!.getEditingCells().length === 0 && ([ColumnET.BEZEICHNUNG, ColumnET.AUFSCHLAG, ColumnET.AUFWAND].includes(e.colDef.field) && !Object.values(SummeET).includes(e.data.bezeichnung))) {
    startEditingCell(e, e.column.colId);
  }
}

const erklaerungsText = ref("");
const erklaerungsTextZusatz = ref("");
const erklaerungsRechnung = ref("");
const erklaerungsRechnungZusatz = ref("");

function onCellClicked(e: any) {
  nextTick(() => colorCellsAndExplain(e.column.colId, e.rowIndex));
}

function clearColorsAndErklaerungen() {
  columnDefs.value.forEach(column => {
    column.editable = false;
    column.cellStyle = {};
  });
  erklaerungsText.value = "";
  erklaerungsTextZusatz.value = "";
  erklaerungsRechnung.value = "";
  erklaerungsRechnungZusatz.value = "";
}

function colorCellsAndExplain(column: string, rowIndex: number) {
  clearColorsAndErklaerungen();
  colorCells(column, rowIndex);
  erklaerungenErstellen(column, rowIndex);
  refreshTable(column, rowIndex);
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
      erklaerungsText.value = "Der Aufschlag der Zwischensumme ist die Summe aller Aufschläge des vorigen Abschnitts.";
      for (let i = vorigerAbschnittEintraege.length - 1; i >= 1; i--) {
        let aufschlag;
        if (vorigerAbschnittEintraege[i].isAufwandRelativBase) {
          aufschlag = vorigerAbschnittEintraege[i].aufwandRelativ;
        } else aufschlag = vorigerAbschnittEintraege[i].aufwandRelativ.toFixed(projectStore.nachkommastellen);
        erklaerungsRechnung.value += aufschlag + "% + ";
      }
      let startaufschlag;
      if (vorigerAbschnittEintraege[0].isAufwandRelativBase) {
        startaufschlag = vorigerAbschnittEintraege[0].aufwandRelativ;
      } else startaufschlag = vorigerAbschnittEintraege[0].aufwandRelativ.toFixed(projectStore.nachkommastellen);
      erklaerungsRechnung.value += startaufschlag + "%";
      erklaerungsRechnung.value = `Das ergibt <span style=color:green>${erklaerungsRechnung.value}</span> = <span style=color:red>${aktuellerEintrag.vorigerAbschnittAufschlag.toFixed(projectStore.nachkommastellen)}%</span>`
      break;
    }
    default : {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      erklaerungsText.value = "Der Aufschlag errechnet sich durch das Dividieren des Aufwands durch die letzte Zwischensumme.";
      let aufwand;
      let aufschlag;
      const zwischensumme = aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand.toFixed(projectStore.nachkommastellen);
      if (aktuellerEintrag.isAufwandRelativBase) {
        aufwand = aktuellerEintrag.aufwandAbsolut.toFixed(projectStore.nachkommastellen);
        aufschlag = aktuellerEintrag.aufwandRelativ;
      } else {
        aufwand = aktuellerEintrag.aufwandAbsolut;
        aufschlag = aktuellerEintrag.aufwandRelativ.toFixed(projectStore.nachkommastellen);
      }
      erklaerungsRechnung.value = `Das ergibt <span style=color:green>${aufwand}</span> / <span style=color:blue> ${zwischensumme}</span> = <span style=color:red>${aufschlag}%</span>`;
      break;
    }
  }
}

function erklaereAufwand(bezeichnung: string, rowIndex: number) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME: {
      erklaerungsText.value = "Das ist die Startsumme, die sich aus der durschnittlichen Summe aller Pakete ergibt.";
      erklaerungsRechnung.value = `Das ergibt hier <span style=color:blue>${(rowData[0] as Zwischensumme).zwischensummeAufwand.toFixed(projectStore.nachkommastellen)}</span>`;
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      const vorigerAbschnittEintraege: Eintrag[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(rowData[i] as Eintrag);
      }
      erklaerungsText.value = "Der Aufwand der Zwischensumme ist zweigeteilt. Der obere Wert ergibt sich aus der Summe aller Aufwände des vorigen Abschnitts. ";
      erklaerungsTextZusatz.value = "Der untere Wert ergibt sich aus der Summe des oberen Wertes und der Startsumme.";
      for (let i = vorigerAbschnittEintraege.length - 1; i >= 1; i--) {
        let aufwand;
        if (vorigerAbschnittEintraege[i].isAufwandRelativBase) {
          aufwand = vorigerAbschnittEintraege[i].aufwandAbsolut.toFixed(projectStore.nachkommastellen);
        } else aufwand = vorigerAbschnittEintraege[i].aufwandAbsolut;
        erklaerungsRechnung.value += "<span style=color:green>" + aufwand + " +</span> ";
      }
      let startaufwand;
      if (vorigerAbschnittEintraege[0].isAufwandRelativBase) {
        startaufwand = vorigerAbschnittEintraege[0].aufwandAbsolut;
      } else startaufwand = vorigerAbschnittEintraege[0].aufwandAbsolut.toFixed(projectStore.nachkommastellen);
      erklaerungsRechnung.value += +startaufwand;
      erklaerungsRechnung.value = `Das ergibt für den oberen Wert <span style=color:green>${erklaerungsRechnung.value}</span> = <span style=color:red>${aktuellerEintrag.vorigerAbschnittAufwand.toFixed(projectStore.nachkommastellen)}</span>`
      erklaerungsRechnungZusatz.value = `Für den unteren Wert ergibt das <span style=color:red>${aktuellerEintrag.vorigerAbschnittAufwand.toFixed(projectStore.nachkommastellen)}</span> + <span style=color:blue>${vorigerAbschnittEintraege[0].referenzierteZwischensumme.zwischensummeAufwand}</span> = <span style=color:red>${aktuellerEintrag.zwischensummeAufwand.toFixed(projectStore.nachkommastellen)}</span>`;
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
      erklaerungsRechnung.value += gridApi.value!.getRowNode("0")!.data.zwischensummeAufwand;
      for (let i = alleEintraege.length - 1; i >= 0; i--) {
        erklaerungsRechnung.value += " + " + alleEintraege[i].toFixed(projectStore.nachkommastellen);
      }
      erklaerungsText.value = "Die Endsumme ergibt sich aus der Summe aller voriger Aufwände und der Startsumme.";
      erklaerungsRechnung.value = `Das ergibt <span style=color:green>${erklaerungsRechnung.value}</span> = <span style=color:red>${endsumme.zwischensummeAufwand.toFixed(projectStore.nachkommastellen)}</span>`
      break;
    }
    default : {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      const zwischensumme = aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand.toFixed(projectStore.nachkommastellen);
      erklaerungsText.value = "Der Aufwand errechnet sich durch das Multiplizieren des Aufschlags mit der Zwischensumme.";
      let aufwand;
      let aufschlag;
      if (aktuellerEintrag.isAufwandRelativBase) {
        aufwand = aktuellerEintrag.aufwandAbsolut.toFixed(projectStore.nachkommastellen);
        aufschlag = aktuellerEintrag.aufwandRelativ;
      } else {
        aufwand = aktuellerEintrag.aufwandAbsolut;
        aufschlag = aktuellerEintrag.aufwandRelativ.toFixed(projectStore.nachkommastellen);
      }
      erklaerungsRechnung.value = `Das ergibt <span style=color:green>${aufschlag}%</span> * <span style=color:blue>${zwischensumme}</span> = <span style=color:red>${aufwand}</span>`;
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
      erklaerungsText.value = "Der Anteil an nächster Zwischensumme bedeutet hier, wie viel Aufwand in Prozent der vorige Abschnitt für die aktuelle Zwischensumme ausmacht.";
      erklaerungsRechnung.value = `Daraus ergibt sich <span style=color:green>${aktuellerEintrag.vorigerAbschnittAufwand.toFixed(projectStore.nachkommastellen)}</span> / <span style=color:blue>${aktuellerEintrag.zwischensummeAufwand.toFixed(projectStore.nachkommastellen)}</span> = <span style=color:red>${aktuellerEintrag.anteilZwischensumme.toFixed(projectStore.nachkommastellen)}%</span>`
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
      erklaerungsText.value = "Der Anteil an nächster Zwischensumme zeigt, wie viel Aufwand in Prozent der aktuelle Eintrag für die nächste Zwischensumme ausmacht.";
      erklaerungsRechnung.value = `Das ergibt <span style=color:green>${aktuellerEintrag.aufwandAbsolut.toFixed(projectStore.nachkommastellen)}</span> / <span style=color:blue>${naechsteZwischensumme.toFixed(projectStore.nachkommastellen)}</span> = <span style=color:red>${aktuellerEintrag.anteilZwischensumme.toFixed(projectStore.nachkommastellen)}%</span>`
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
      erklaerungsText.value = "Der Anteil am Gesamtporjekt zeigt, wie viel Aufwand in Prozent der vorige Abschnitt für die Endsumme ausmacht.";
      erklaerungsRechnung.value = `Daraus ergibt sich <span style=color:green>${aktuellerEintrag.vorigerAbschnittAufwand.toFixed(projectStore.nachkommastellen)}</span> / <span style=color:blue>${endsumme.zwischensummeAufwand.toFixed(projectStore.nachkommastellen)}</span> = <span style=color:red>${aktuellerEintrag.anteilGesamtprojekt.toFixed(projectStore.nachkommastellen)}%</span>`;
      break;
    }
    default: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      erklaerungsText.value = "Der Anteil am Gesamtprojekt zeit, wie viel Aufwand in Prozent der aktuelle Eintrag für das Gesamtprojekt ausmacht.";
      erklaerungsRechnung.value = `Das ergibt <span style=color:green>${aktuellerEintrag.aufwandAbsolut.toFixed(projectStore.nachkommastellen)}</span> / <span style=color:blue>${endsumme.zwischensummeAufwand.toFixed(projectStore.nachkommastellen)}</span> = <span style=color:red>${aktuellerEintrag.anteilGesamtprojekt.toFixed(projectStore.nachkommastellen)}%</span>`;
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
        columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
          if (params.rowIndex == 0) return { "background-color": "blue", color: "white" };
        };
      }
      break;
    case SummeET.ENDSUMME: {
      if (column == ColumnET.AUFWAND) {
        const alleEintraege: number[] = [0];
        for (let i = 1; i < rowData.length - 1; i++) {
          if (rowData[i] instanceof Eintrag) {
            alleEintraege.push(i);
          }
          columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
            if (alleEintraege.includes(params.rowIndex)) return {
              "background-color": "green",
              color: "white"
            };
            if (params.rowIndex == rowData.length - 1) return { "background-color": "red", color: "white" };
          };
        }
      }
      break;
    }
    case SummeET.ZWISCHENSUMME : {
      const vorigerAbschnittEintraege: number[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(i);
      }
      columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == column)!.cellStyle = (params: any) => {
        if (params.rowIndex == rowIndex) return { "background-color": "red", color: "white" };
        if (vorigerAbschnittEintraege.includes(params.rowIndex)) return {
          "background-color": "green",
          color: "white"
        };
        if (params.rowIndex == vorigerAbschnittEintraege[vorigerAbschnittEintraege.length - 1] - 1 && column == ColumnET.AUFWAND) return {
          "background-color": "blue",
          color: "white"
        };
        return { color: "black" };
      };
      break;
    }
    default: {
      const columnNeighbor = column == ColumnET.AUFSCHLAG ? ColumnET.AUFWAND : ColumnET.AUFSCHLAG;
      for (let i = rowIndex; i >= 0; i--) {
        if ([SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung)) {
          columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == column)!.cellStyle = (params: any) => {
            if (params.rowIndex == i && column == ColumnET.AUFWAND) return {
              "background-color": "blue",
              color: "white"
            };
            if (params.rowIndex == rowIndex) return { "background-color": "red", color: "white" };
            return { color: "black" };
          };
          columnDefs.value.find(column => column.field == columnNeighbor)!.cellStyle = (params: any) => {
            if (params.rowIndex == i && column == ColumnET.AUFSCHLAG) return {
              "background-color": "blue",
              color: "white"
            };
            if (params.rowIndex == rowIndex) return { "background-color": "green", color: "white" };
            return { color: "black" };
          };
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
      columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
        if (params.rowIndex == rowIndex) return { "background-color": "blue", color: "white" };
        if (vorigerAbschnittEintraege.includes(params.rowIndex)) return { "background-color": "green", color: "white" };
        return { color: "black" };
      };
      columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.ZWISCHENSUMME)!.cellStyle = (params: any) => {
        if (params.rowIndex == rowIndex) return { "background-color": "red", color: "white" };
        return { color: "black" };
      };
      break;
    }
    default: {
      for (let i = rowIndex; i < rowData.length; i++) {
        if ([SummeET.ZWISCHENSUMME as string, SummeET.ENDSUMME as string].includes(rowData[i].bezeichnung)) {
          columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
            if (params.rowIndex == i) return { "background-color": "blue", color: "white" };
            if (params.rowIndex == rowIndex) return { "background-color": "green", color: "white" };
            return { color: "black" };
          };
          columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.ZWISCHENSUMME)!.cellStyle = (params: any) => {
            if (params.rowIndex == rowIndex) return { "background-color": "red", color: "white" };
            return { color: "black" };
          };
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
      columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.AUFWAND)!.cellStyle = (params: any) => {
        if (params.rowIndex == rowIndex) return { "background-color": "green", color: "white" };
        if (params.rowIndex == rowData.length - 1) return { "background-color": "blue", color: "white" };
        return { color: "black" };
      };
      columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == ColumnET.GESAMTPROJEKT)!.cellStyle = (params: any) => {
        if (params.rowIndex == rowIndex) return { "background-color": "red", color: "white" };
        return { color: "black" };
      };
    }
  }
}

function onCellValueChanged(e: any) {
  gridApi.value!.forEachNode(function(node) {
    if (node.data.bezeichnung === SummeET.ZWISCHENSUMME) node.setRowHeight(80);
  });
  gridApi.value!.onRowHeightChanged();
  nextTick(() => colorCellsAndExplain(e.column.getColId(), e.rowIndex));
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
          if (e.data.bezeichnung == SummeET.STARTSUMME && (shift || ctrl)) {
            refreshTable(e.column, 1);
          } else if (shift || ctrl) {
            nextTick(() => moveZeileDown());
          } else {
            const focusedCell = gridApi.value!.getFocusedCell()!;
            const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
            nextTick(() => colorCellsAndExplain(colKey, focusedCell.rowIndex));
          }
          break;
        }
        case "ArrowUp": {
          if (e.data.bezeichnung == SummeET.ENDSUMME && (shift || ctrl)) {
            refreshTable(e.column, rowData.length - 2);
          } else if (shift || ctrl) {
            nextTick(() => moveZeileUp());
          } else {
            const focusedCell = gridApi.value!.getFocusedCell()!;
            const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
            nextTick(() => colorCellsAndExplain(colKey, focusedCell.rowIndex));
          }
          break;
        }
        case "ArrowRight":
        case "ArrowLeft": {
          const focusedCell = gridApi.value!.getFocusedCell()!;
          const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
          if (selectedPaket) {
            selectedPaket.setSelected(true);
          }
          nextTick(() => colorCellsAndExplain(focusedCell.column.getId(), focusedCell.rowIndex));
          break;
        }
        case "_":
        case "-": {
          if (!ctrl) nextTick(() => eintragEntfernen());
          break;
        }
        case "Delete": {
          if (shift || ctrl) {
            nextTick(() => eintragEntfernen());
          } else {
            if (![ColumnET.ZWISCHENSUMME, ColumnET.GESAMTPROJEKT].includes(colKey) && ![SummeET.ZWISCHENSUMME, SummeET.STARTSUMME, SummeET.ENDSUMME].includes(e.data.bezeichnung)) {
              if (colKey == ColumnET.AUFWAND) {
                eintraegeStore.updateAufwand(e.rowIndex, 0);
              } else if (colKey == ColumnET.AUFSCHLAG) {
                eintraegeStore.updateAufschlag(e.rowIndex, 0);
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
          nextTick(() => colorCellsAndExplain(colKey, e.rowIndex));
          break;
        }
        case "Escape": {
          stopEiditingAndSetFocus(true, e.rowIndex, colKey);
          nextTick(() => colorCellsAndExplain(colKey, e.rowIndex));
          break;
        }
      }
    }
  }
}

function startEditingCell(e: any, colKey: string) {
  if ([ColumnET.BEZEICHNUNG, ColumnET.AUFSCHLAG, ColumnET.AUFWAND].includes(colKey as ColumnET) && !Object.values(SummeET).includes(e.data.bezeichnung)) {
    if (colKey as ColumnET == ColumnET.AUFSCHLAG && !e.data.isAufwandRelativBase) {
      e.data.aufwandRelativ = parseFloat(e.data.aufwandRelativ.toFixed(projectStore.nachkommastellen));
    } else if (colKey as ColumnET == ColumnET.AUFWAND && e.data.isAufwandRelativBase) {
      e.data.aufwandAbsolut = parseFloat(e.data.aufwandAbsolut.toFixed(projectStore.nachkommastellen));
    }
    columnDefs.value!.find(column => column.field === colKey)!.editable = true;
    columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == colKey)!.cellStyle = (params: any) => {
      if (params.rowIndex == e.rowIndex) return { color: "black" };
    };
    nextTick(() => gridApi.value!.startEditingCell({
      rowIndex: e.rowIndex,
      colKey: e.column
    }));
  }
}

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  gridApi.value!.stopEditing(cancel);
  nextTick(() => eintraegeStore.berechne());
  columnDefs.value!.forEach(column => column.editable = false);
  gridApi.value!.setFocusedCell(rowIndex, colKey);
  refreshTable(colKey, rowIndex);
}

function eintragErstellen() {
  if (gridApi.value!.getSelectedRows()[0] && gridApi.value!.getSelectedRows()[0].bezeichnung !== SummeET.ENDSUMME) {
    const rowIndexSelectedRow = rowData.indexOf(gridApi.value!.getSelectedRows()[0]);
    eintraegeStore.addNewAufschlag(rowIndexSelectedRow);
    const focusedCell = gridApi.value!.getFocusedCell();
    let colKey = "";
    if (focusedCell != null) {
      colKey = focusedCell.column.getColId();
    } else colKey = columnApi.value!.getColumns()![0].getColId();
    refreshTable(colKey, rowIndexSelectedRow + 1);
    nextTick(() => colorCellsAndExplain(colKey, rowIndexSelectedRow + 1));
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
      nextTick(() => colorCellsAndExplain(focusedCell.column.getColId(), focusedCell.rowIndex + 1));
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
        nextTick(() => colorCellsAndExplain(focusedRowColKey.getColId(), focusedRowIndex - 1));
      } else {
        refreshTable(focusedRowColKey, focusedRowIndex);
        nextTick(() => colorCellsAndExplain(focusedRowColKey.getColId(), focusedRowIndex));
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
      nextTick(() => colorCellsAndExplain(focusedRowColKey.getColId(), focusedRowIndex - 1));
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
      nextTick(() => colorCellsAndExplain(focusedRowColKey.getColId(), focusedRowIndex + 1));
    }
  }
}

function refreshTable(colKey?: Column | string, rowIndex?: number) {
  nextTick(() => {
    gridApi.value!.setRowData(eintraegeStore.eintraege);
    gridApi.value!.forEachNode(function(node) {
      if (node.data.bezeichnung === SummeET.ZWISCHENSUMME) node.setRowHeight(80);
    });
    gridApi.value!.onRowHeightChanged();
    columnDefs.value!.forEach(column => column.editable = false);
    if (rowIndex != undefined && colKey != undefined) {
      gridApi.value!.getRowNode(rowIndex + "")!.setSelected(true);
      gridApi.value!.setFocusedCell(rowIndex, colKey);
    }
    gridApi.value!.refreshCells({ force: true });
  });
}

</script>
<style scoped>

</style>

