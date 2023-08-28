<template>

  <div class="d-flex flex-row" style="width: 100%;height: 100%">
    <ag-grid-vue
      :columnDefs="columnDefs"
      :defaultColDef="defaultColDef"
      :rowData="rowData"
      class="ag-theme-alpine"
      rowSelection="single"
      style="width: 65%;height: 100%"
      @cellValueChanged="onCellValueChanged"
      @contextmenu="rightClickOnCell"
      @cell-clicked="onCellClicked"
      @cell-key-down="onCellKeyPress"
      @cell-double-clicked="onCellDoubleClicked"
      @grid-ready="onGridReady"
    ></ag-grid-vue>
    <div style="width:35%; border: 1px solid black">
      <div>{{ erklaerungsText }}</div>
      <div v-if="erklaerungsTextZusatz!=''">{{ erklaerungsTextZusatz }}</div>
      <div>{{ erklaerungsRechnung }}</div>
      <div v-if="erklaerungsRechnungZusatz!=''">{{ erklaerungsRechnungZusatz }}</div>
    </div>
  </div>
  <context-menu ref="contextMenuRef" :providedFunctionsProp="[...providedFunctions]"></context-menu>
</template>
<script lang="ts" setup>
import BezeichnungCellRenderer from "@/components/projektkalkulation/BezeichnungCellRenderer.vue";
import AufschlagCellRenderer from "@/components/projektkalkulation/AufschlagCellRenderer.vue";
import AufwandCellRenderer from "@/components/projektkalkulation/AufwandCellRenderer.vue";
import AnteilAnZwischensummeCellRenderer from "@/components/projektkalkulation/AnteilAnZwischensummeCellRenderer.vue";
import AnteilAmGesamtprojektCellRenderer from "@/components/projektkalkulation/AnteilAmGesamtprojektCellRenderer.vue";
import { AgGridVue } from "ag-grid-vue3";
import { nextTick, provide, reactive, ref } from "vue";
import { Column, ColumnApi, GridApi } from "ag-grid-community";
import { useEintraegeStore } from "@/stores/eintraege";
import ContextMenu from "@/components/ContextMenu.vue";
import { Eintrag } from "@/Eintrag";
import { Zwischensumme } from "@/Zwischensumme";
import { SummeET } from "@/enums/SummeET";
import { ColumnET } from "@/enums/ColumnET";

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
  contextMenuRef.value!.showMenu(e);
  if (gridApi.value!.getFocusedCell()!) {
    const focusedRowIndex = gridApi.value!.getFocusedCell()!.rowIndex;
    gridApi.value!.getDisplayedRowAtIndex(focusedRowIndex)!.setSelected(true);
  }
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
    field: "aufschlagWert",
    headerName: "Aufschlag",
    cellRenderer: AufschlagCellRenderer,
    cellStyle: {},
    editable: false
  },
  {
    field: "aufwandWert",
    headerName: "Aufwand",
    cellRenderer: AufwandCellRenderer,
    cellStyle: {},
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
  colorCellsAndExplain(e.data.bezeichnung, e.column.colId, e.rowIndex);
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

function colorCellsAndExplain(bezeichnung: string, column: string, rowIndex: number) {
  clearColorsAndErklaerungen();
  colorCells(bezeichnung, column, rowIndex);
  erklaerungenErstellen(bezeichnung, column, rowIndex);
  refreshTable(column, rowIndex);
}

function erklaerungenErstellen(bezeichnung: string, column: string, rowIndex: number) {
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
      erklaereZwischensumme(bezeichnung, rowIndex);
      break;
    case ColumnET.GESAMTPROJEKT:
      erklaereGesamtprojekt(bezeichnung, rowIndex);
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
      erklaerungsText.value = "Der Aufschlag der Zwischensumme ist die SummeET aller Aufschläge des vorigen Abschnitts.";
      for (let i = vorigerAbschnittEintraege.length - 1; i >= 1; i--) {
        erklaerungsRechnung.value += vorigerAbschnittEintraege[i].aufschlagWert + "% + ";
      }
      erklaerungsRechnung.value += vorigerAbschnittEintraege[0].aufschlagWert + "%";
      erklaerungsRechnung.value = "Das ergibt " + erklaerungsRechnung.value + " = " + aktuellerEintrag.vorigerAbschnittAufschlag + "%";
      break;
    }
    default : {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      erklaerungsText.value = "Der Aufschlag errechnet sich durch das Dividieren des Aufwands durch den Aufschlag.";
      erklaerungsRechnung.value = "Das ergibt " + aktuellerEintrag.aufwandWert + " / " + aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand + " = " + aktuellerEintrag.aufschlagWert + "%";
      break;
    }
  }
}

function erklaereAufwand(bezeichnung: string, rowIndex: number) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME: {
      erklaerungsText.value = "Das ist die Startsumme, die sich aus der durschnittlichen SummeET aller Pakete ergibt.";
      erklaerungsRechnung.value = "Das ergibt hier " + (rowData[0] as Zwischensumme).zwischensummeAufwand;
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      const vorigerAbschnittEintraege: Eintrag[] = [];
      for (let i = rowIndex - 1; ![SummeET.STARTSUMME as string, SummeET.ZWISCHENSUMME as string].includes(rowData[i].bezeichnung); i--) {
        vorigerAbschnittEintraege.push(rowData[i] as Eintrag);
      }
      erklaerungsText.value = "Der Aufwand der Zwischensumme ist zweigeteilt. Der obere Wert ergibt sich aus der SummeET aller Aufwände des vorigen Abschnitts. ";
      erklaerungsTextZusatz.value = "Der untere Wert ergibt sich aus der SummeET des oberen Wertes und der Startsumme.";
      for (let i = vorigerAbschnittEintraege.length - 1; i >= 1; i--) {
        erklaerungsRechnung.value += vorigerAbschnittEintraege[i].aufwandWert + " + ";
      }
      erklaerungsRechnung.value += vorigerAbschnittEintraege[0].aufwandWert;
      erklaerungsRechnung.value = "Das ergibt für den oberen Wert " + erklaerungsRechnung.value + " = " + aktuellerEintrag.vorigerAbschnittAufwand;
      erklaerungsRechnungZusatz.value = "Für den unteren Wert ergibt das " + aktuellerEintrag.vorigerAbschnittAufwand + " + " + vorigerAbschnittEintraege[0].referenzierteZwischensumme.zwischensummeAufwand + " = " + aktuellerEintrag.zwischensummeAufwand;
      break;
    }
    case SummeET.ENDSUMME: {
      const endsumme = gridApi.value!.getRowNode(rowData.length - 1 + "")!.data as Zwischensumme;
      const alleEintraege: number[] = [];
      for (let i = rowIndex - 1; i >= 1; i--) {
        if (rowData[i] instanceof Eintrag) {
          alleEintraege.push((rowData[i] as Eintrag).aufwandWert);
        }
      }
      erklaerungsRechnung.value += gridApi.value!.getRowNode("0")!.data.zwischensummeAufwand;
      for (let i = alleEintraege.length - 1; i >= 0; i--) {
        erklaerungsRechnung.value += " + " + alleEintraege[i];
      }
      erklaerungsText.value = "Die Endsumme ergibt sich aus der SummeET aller voriger Aufwände und der Startsumme.";
      erklaerungsRechnung.value = "Das ergibt " + erklaerungsRechnung.value + " = " + endsumme.zwischensummeAufwand;
      break;
    }
    default : {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      erklaerungsText.value = "Der Aufwand errechnet sich durch das Multiplizieren des Aufschlags mit der Zwischensumme.";
      erklaerungsRechnung.value = `Das ergibt ${aktuellerEintrag.aufschlagWert}% * ${aktuellerEintrag.referenzierteZwischensumme.zwischensummeAufwand} = ${aktuellerEintrag.aufwandWert}`
      break;
    }
  }
}

function erklaereZwischensumme(bezeichnung: string, rowIndex: number) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME : {
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      erklaerungsText.value = "Der Anteil an nächster Zwischensumme bedeutet hier, wie viel Aufwand in Prozent der vorige Abschnitt für die aktuelle Zwischensumme ausmacht.";
      erklaerungsRechnung.value = "Daraus ergibt sich " + aktuellerEintrag.vorigerAbschnittAufwand + " / " + aktuellerEintrag.zwischensummeAufwand + " = " + aktuellerEintrag.anteilZwischensumme + "%";
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
      erklaerungsRechnung.value = "Das ergibt " + aktuellerEintrag.aufwandWert + " / " + naechsteZwischensumme + " = " + aktuellerEintrag.anteilZwischensumme + "%";
    }
  }
}

function erklaereGesamtprojekt(bezeichnung: string, rowIndex: number) {
  const endsumme = gridApi.value!.getRowNode(rowData.length - 1 + "")!.data as Zwischensumme;
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
    case SummeET.ENDSUMME: {
      break;
    }
    case SummeET.ZWISCHENSUMME: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Zwischensumme;
      erklaerungsText.value = "Der Anteil am Gesamtporjekt zeigt, wie viel Aufwand in Prozent der vorige Abschnitt für die Endsumme ausmacht.";
      erklaerungsRechnung.value = "Daraus ergibt sich " + aktuellerEintrag.zwischensummeAufwand + " / " + endsumme.zwischensummeAufwand + " = " + aktuellerEintrag.anteilGesamtprojekt + "%";
      break;
    }
    default: {
      const aktuellerEintrag = gridApi.value!.getRowNode(rowIndex + "")!.data as Eintrag;
      erklaerungsText.value = "Der Anteil am Gesamtprojekt zeit, wie viel Aufwand in Prozent der aktuelle Eintrag für das Gesamtprojekt ausmacht.";
      erklaerungsRechnung.value = "Das ergibt " + aktuellerEintrag.aufwandWert + " / " + endsumme.zwischensummeAufwand + " = " + aktuellerEintrag.anteilGesamtprojekt + "%";
    }
  }
}

function colorCells(bezeichnung: string, column: string, rowIndex: number) {
  switch (column) {
    case ColumnET.AUFSCHLAG:
    case ColumnET.AUFWAND : {
      colorAufschlagUndAufwand(bezeichnung, rowIndex, column);
      break;
    }
    case ColumnET.ZWISCHENSUMME: {
      colorZwischensumme(bezeichnung, rowIndex);
      break;
    }
    case ColumnET.GESAMTPROJEKT: {
      colorGesamtprojekt(bezeichnung, rowIndex);
      break;
    }
  }
}

function colorAufschlagUndAufwand(bezeichnung: string, rowIndex: number, column: string) {
  switch (bezeichnung) {
    case SummeET.STARTSUMME:
      if(column==ColumnET.AUFWAND) {
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

function colorZwischensumme(bezeichnung: string, rowIndex: number) {
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

function colorGesamtprojekt(bezeichnung: string, rowIndex: number) {
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
  switch (e.colDef.field) {
    case ColumnET.BEZEICHNUNG:
      eintraegeStore.updateBezeichnung(e.rowIndex, e.newValue);
      break;
    case ColumnET.AUFSCHLAG:
      if (!isNaN(e.newValue)) eintraegeStore.updateAufschlag(e.rowIndex, +e.newValue);
      else e.data.aufschlagWert = e.oldValue;
      break;
    case ColumnET.AUFWAND:
      if (!isNaN(e.newValue)) eintraegeStore.updateAufwand(e.rowIndex, +e.newValue);
      else e.data.aufwandWert = e.oldValue;
      break;
  }
  refreshTable(e.column.colId, e.rowIndex);
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
            moveZeileDown();
          } else {
            const focusedCell = gridApi.value!.getFocusedCell()!;
            const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
            colorCellsAndExplain(selectedPaket!.data.bezeichnung, colKey, focusedCell.rowIndex);
          }
          break;
        }
        case "ArrowUp": {
          if (e.data.bezeichnung == SummeET.ENDSUMME && (shift || ctrl)) {
            refreshTable(e.column, rowData.length - 2);
          } else if (shift || ctrl) {
            moveZeileUp();
          } else {
            const focusedCell = gridApi.value!.getFocusedCell()!;
            const selectedPaket = gridApi.value!.getRowNode(focusedCell.rowIndex + "");
            if (selectedPaket) {
              selectedPaket.setSelected(true);
            }
            colorCellsAndExplain(selectedPaket!.data.bezeichnung, colKey, focusedCell.rowIndex);
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
          colorCellsAndExplain(selectedPaket!.data.bezeichnung, focusedCell.column.getId(), focusedCell.rowIndex);
          break;
        }
        case "_":
        case "-": {
          if (!ctrl) eintragEntfernen();
          break;
        }
        case "Delete": {
          if (shift || ctrl) {
            eintragEntfernen();
          } else {
            if (![ColumnET.ZWISCHENSUMME, ColumnET.GESAMTPROJEKT].includes(colKey) && e.data.bezeichnung != SummeET.ZWISCHENSUMME) {
              if (colKey == ColumnET.AUFWAND) {
                eintraegeStore.updateAufwand(e.rowIndex, 0);
              } else if (colKey == ColumnET.AUFSCHLAG) {
                eintraegeStore.updateAufschlag(e.rowIndex, 0);
              } else if (colKey == ColumnET.BEZEICHNUNG) {
                eintraegeStore.updateBezeichnung(e.rowIndex, "");
              }
              refreshTable(colKey, e.rowIndex);
            }
          }
          break;
        }
        case "+" : {
          if (!ctrl)
            eintragErstellen();
          break;
        }
        case "*": {
          if (!ctrl)
            zwischensummeErstellen();
          break;
        }
        case "F2": {
          if ([ColumnET.BEZEICHNUNG, ColumnET.AUFSCHLAG, ColumnET.AUFWAND].includes(colKey) && !Object.values(SummeET).includes(e.data.bezeichnung)) {
            columnDefs.value!.find(column => column.field == colKey)!.editable = true;
            nextTick(() => gridApi.value!.startEditingCell({
              rowIndex: e.rowIndex,
              colKey: e.column
            }));
            columnDefs.value.find(columnOfColumnDefs => columnOfColumnDefs.field == colKey)!.cellStyle = (params: any) => {
              if (params.rowIndex == e.rowIndex) return { color: "black" };
            };
          }
          break;
        }
      }
    } else {
      switch (key) {
        case "Enter": {
          colorCellsAndExplain(e.data.bezeichnung, colKey, e.rowIndex);
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

function stopEiditingAndSetFocus(cancel: boolean, rowIndex: number, colKey: string) {
  gridApi.value!.stopEditing(cancel);
  columnDefs.value!.forEach(column => column.editable = false);
  gridApi.value!.setFocusedCell(rowIndex, colKey);
  refreshTable(colKey, rowIndex);
}

function startEditingCell(e: any, colKey: string) {
  if (!((colKey === "bucket" || colKey === "schaetzung") && e.data.children.length !== 0)) {
    columnDefs.value!.find(column => column.field === colKey)!.editable = true;
    nextTick(() => gridApi.value!.startEditingCell({
      rowIndex: e.rowIndex,
      colKey: e.column
    }));
  }
}

function eintragErstellen() {
  if (gridApi.value!.getSelectedRows()[0] && gridApi.value!.getSelectedRows()[0].bezeichnung !== SummeET.ENDSUMME) {
    const rowIndexSelectedRow = rowData.indexOf(gridApi.value!.getSelectedRows()[0]);
    eintraegeStore.addNewAufschlag(rowIndexSelectedRow);
    refreshTable(columnApi.value!.getColumns()![0].getColId(), rowIndexSelectedRow + 1);
  }
}

function zwischensummeErstellen() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedCell = gridApi.value!.getFocusedCell();
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    const bezeichnungSelectedRowUnder = rowData[focusedCell!.rowIndex + 1].bezeichnung;
    if (!Object.values(SummeET).includes(bezeichnungSelectedRow) && ![SummeET.ZWISCHENSUMME as string ,SummeET.STARTSUMME as string].includes(bezeichnungSelectedRowUnder)) {
      eintraegeStore.addNewZwischensumme(focusedCell!.rowIndex);
      refreshTable(focusedCell!.column, focusedCell!.rowIndex + 1);
    }
  }
}

function eintragEntfernen() {
  if (gridApi.value!.getSelectedRows()[0]) {
    const focusedCell = gridApi.value!.getFocusedCell();
    const focusedRowIndex = focusedCell!.rowIndex;
    const focusedRowColKey = focusedCell!.column;
    const bezeichnungSelectedRow = gridApi.value!.getSelectedRows()[0].bezeichnung;
    if (![SummeET.STARTSUMME, SummeET.ENDSUMME].includes(bezeichnungSelectedRow)) {
      eintraegeStore.deleteEintrag(focusedRowIndex);
      if (rowData[focusedRowIndex]) refreshTable(focusedRowColKey, focusedRowIndex);
      else if (rowData.length !== 0) {
        refreshTable(focusedRowColKey, rowData.length - 1);
      } else {
        refreshTable(focusedRowColKey);
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

function refreshTable(colKey?: Column | string, rowIndex?: number) {
  nextTick(() => {
    //this.rowData = this.eintraegeStore.eintraege;
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

