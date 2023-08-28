import { useProjektStore } from "@/stores/projekt";

export const enum RundungsartET {
  KAUFMAENNISCH = "Kaufmännisch",
  SYMMETRISCH = "Symmetrisch"
}

export function runden(zahl: number): number {
  const projectStore = useProjektStore();
  if (projectStore.rundungsart == RundungsartET.KAUFMAENNISCH) {
    return kaufmaennischesRunden(zahl, projectStore.nachkommastellen);
  } else {
    return symmetrischesRunden(zahl, projectStore.nachkommastellen);
  }
}

function kaufmaennischesRunden(zahl:number, nachkommastellen: number) {
  const d = nachkommastellen || 0;
  const m = Math.pow(10, d);
  const n = +(d ? zahl * m : zahl).toFixed(8); // Avoid rounding errors
  const i = Math.floor(n), f = n - i;
  const e = 1e-8; // Allow for rounding errors in f
  const r = (f > 0.5 - e && f < 0.5 + e) ?
    ((i % 2 == 0) ? i : i + 1) : Math.round(n);
  return d ? r / m : r;
}

function symmetrischesRunden(zahl: number, nachkommastallen: number): number {
  const factor = Math.pow(10, nachkommastallen); // Faktor für zwei Dezimalstellen
  return zahl < 0 ? Math.ceil(zahl * factor - 0.5) / factor : Math.floor(zahl * factor + 0.5) / factor;
}