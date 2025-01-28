import { atom } from "jotai";
import type { MimeOutput } from "./types/mime";
import { AtomMap } from "./utils/jotai";

// Create an atom for each cell's output
export const CellOutputAtoms = new AtomMap<string, MimeOutput[]>(() => []);

// Execution state atoms
export const executingCellsAtom = atom<Set<string>>(new Set<string>());
export const isExecutingNotebookAtom = atom(false);

// Create an atom for each cell's code
export const CodeAtoms = new AtomMap<string, string>(() => "");
