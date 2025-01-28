import { useAtom } from "jotai";
import { CellOutputAtoms } from "../state";
import type { MimeOutput } from "../types/mime";

export function useCellOutput(cellId: string) {
	const [outputs, setOutput] = useAtom(CellOutputAtoms.get(cellId));

	return {
		/** Current outputs for the cell */
		outputs,
		/** Clear all outputs */
		clearOutput: () => setOutput([]),
		/** Append a new output */
		appendOutput: (output: MimeOutput) => setOutput((prev) => [...prev, output]),
		/** Replace all outputs */
		setOutput,
	};
}
