import { useAtom, useSetAtom, useStore } from "jotai";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useCallback } from "react";
import { CodeAtoms } from "../state";
import { executingCellsAtom, isExecutingNotebookAtom } from "../state";
import { CellOutputAtoms } from "../state";
import type { MimeOutput } from "../types/mime";
import { convertToMimeOutput } from "./CellOutput";
import { usePyodide } from "./Provider";

interface CellRunButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	/** Class name for the button */
	className?: string;
	/** Whether the button is disabled */
	disabled?: boolean;
	/** Unique identifier for this cell */
	id: string;
	/** Called before execution starts */
	onExecutionStart?: () => void;
	/** Called after execution completes */
	onExecutionComplete?: (error?: Error) => void;
	/** Content to render inside the button */
	children?: ReactNode | ((props: { isRunning: boolean }) => ReactNode);
}

export function CellRunButton({
	className,
	disabled,
	id,
	onExecutionStart,
	onExecutionComplete,
	children = "Run",
	...buttonProps
}: CellRunButtonProps) {
	const { runPython, loading, pyodide } = usePyodide();
	const store = useStore();
	const setOutput = useSetAtom(CellOutputAtoms.get(id));
	const [executingCells, setExecutingCells] = useAtom(executingCellsAtom);

	const handleRun = useCallback(async () => {
		if (executingCells.has(id)) return;
		if (!pyodide) return;

		try {
			onExecutionStart?.();
			setExecutingCells(new Set([...executingCells, id]));
			setOutput([]);

			const code = store.get(CodeAtoms.get(id));
			const result = await runPython(code);
			setOutput([convertToMimeOutput(pyodide, "result", result)]);
			onExecutionComplete?.();
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			setOutput([convertToMimeOutput(pyodide, "error", error.message)]);
			onExecutionComplete?.(error);
		} finally {
			setExecutingCells(new Set([...executingCells].filter((cellId) => cellId !== id)));
		}
	}, [
		id,
		pyodide,
		store,
		runPython,
		setOutput,
		executingCells,
		setExecutingCells,
		onExecutionStart,
		onExecutionComplete,
	]);

	const isRunning = executingCells.has(id);
	const isDisabled = disabled || isRunning || loading;

	return (
		<button
			type="button"
			onClick={handleRun}
			disabled={isDisabled}
			aria-disabled={isDisabled}
			aria-label={"Running cell"}
			aria-busy={isRunning}
			className={className}
			data-cell-id={id}
			data-running={isRunning}
			{...buttonProps}
		>
			{typeof children === "function" ? children({ isRunning }) : children}
		</button>
	);
}

interface NotebookRunButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
	/** Class name for the button */
	className?: string;
	/** Array of cell IDs in execution order */
	cellIds?: string[];
	/** Called before execution starts */
	onExecutionStart?: () => void;
	/** Called after execution completes */
	onExecutionComplete?: (error?: Error) => void;
	/** Label for the button (for accessibility) */
	label?: string;
	/** Content to render inside the button */
	children?: ReactNode | ((props: { isRunning: boolean }) => ReactNode);
}

export function NotebookRunButton({
	className,
	cellIds,
	onExecutionStart,
	onExecutionComplete,
	children = "Run All",
	...buttonProps
}: NotebookRunButtonProps) {
	const { runPython, pyodide } = usePyodide();
	const [isExecuting, setIsExecuting] = useAtom(isExecutingNotebookAtom);
	const setExecutingCells = useSetAtom(executingCellsAtom);
	const store = useStore();

	const handleRunAll = useCallback(async () => {
		if (isExecuting || !pyodide) return;

		try {
			onExecutionStart?.();
			setIsExecuting(true);

			if (!cellIds) {
				cellIds = CodeAtoms.ids;
			}

			for (let i = 0; i < cellIds.length; i++) {
				const id = cellIds[i];
				if (!id) continue;
				const setOutput = (output: MimeOutput[]) => {
					store.set(CellOutputAtoms.get(id), output);
				};

				const code = store.get(CodeAtoms.get(id));
				setExecutingCells(new Set([id]));
				setOutput([]);

				try {
					const result = await runPython(code);
					setOutput([convertToMimeOutput(pyodide, "result", result)]);
				} catch (err) {
					const error = err instanceof Error ? err : new Error(String(err));
					setOutput([convertToMimeOutput(pyodide, "error", error.message)]);
					throw error;
				}
			}

			onExecutionComplete?.();
		} catch (err) {
			const error = err instanceof Error ? err : new Error(String(err));
			onExecutionComplete?.(error);
		} finally {
			setIsExecuting(false);
			setExecutingCells(new Set());
		}
	}, [
		cellIds,
		pyodide,
		isExecuting,
		runPython,
		setIsExecuting,
		setExecutingCells,
		onExecutionStart,
		onExecutionComplete,
		store,
	]);

	return (
		<button
			type="button"
			onClick={handleRunAll}
			disabled={isExecuting}
			aria-disabled={isExecuting}
			aria-label={"Running all cells"}
			aria-busy={isExecuting}
			className={className}
			data-executing={isExecuting}
			{...buttonProps}
		>
			{typeof children === "function" ? children({ isRunning: isExecuting }) : children}
		</button>
	);
}
