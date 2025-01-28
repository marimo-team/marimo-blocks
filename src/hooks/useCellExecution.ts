import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { convertToMimeOutput } from "../components/CellOutput";
import { usePyodide } from "../components/Provider";
import { CellOutputAtoms } from "../state";

interface UseCellExecutionOptions {
	/** Called before execution starts */
	onExecutionStart?: () => void;
	/** Called after execution completes */
	onExecutionComplete?: (error?: Error) => void;
}

export function useCellExecution(cellId: string, options: UseCellExecutionOptions = {}) {
	const { runPython, pyodide } = usePyodide();
	const setOutput = useSetAtom(CellOutputAtoms.get(cellId));

	const execute = useCallback(
		async (code: string) => {
			if (!pyodide) return;

			try {
				options.onExecutionStart?.();
				setOutput([]);

				const result = await runPython(code);
				setOutput([convertToMimeOutput(pyodide, "result", result)]);
				options.onExecutionComplete?.();
				return result;
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setOutput([convertToMimeOutput(pyodide, "error", error.message)]);
				options.onExecutionComplete?.(error);
				throw error;
			}
		},
		[pyodide, runPython, setOutput, options],
	);

	return {
		execute,
	};
}
