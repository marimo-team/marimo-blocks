import { python } from "@codemirror/lang-python";
import { keymap } from "@codemirror/view";
import CodeMirror, { Prec } from "@uiw/react-codemirror";
import { useAtom } from "jotai";
import { useCallback, useEffect } from "react";
import type { HTMLAttributes } from "react";
import { useCellExecution } from "../hooks/useCellExecution";
import { CodeAtoms, executingCellsAtom } from "../state";

interface CellEditorProps extends HTMLAttributes<HTMLDivElement> {
	/** Unique identifier for this cell */
	id: string;
	/** Initial code content */
	code?: string;
	/** Called when code changes */
	onCodeChange?: (code: string) => void;
	/** Whether the cell is read-only */
	readOnly?: boolean;
	/** Class name for the editor container */
	className?: string;
	/** Additional props to pass to the editor container */
	containerProps?: HTMLAttributes<HTMLDivElement>;
	/** Additional props to pass to the CodeMirror instance */
	editorProps?: Parameters<typeof CodeMirror>[0];
	/** Label for the editor (for accessibility) */
	label?: string;
}

export function CellEditor({
	id,
	code: initialCode = "",
	onCodeChange,
	readOnly = false,
	className,
	editorProps,
	...containerProps
}: CellEditorProps) {
	const [code, setCode] = useAtom(CodeAtoms.get(id, initialCode));
	const [executingCells] = useAtom(executingCellsAtom);
	const isExecuting = executingCells.has(id);
	const { execute } = useCellExecution(id);

	// Remove atom
	useEffect(() => {
		CodeAtoms.delete(id);
	}, [id]);

	const handleChange = useCallback(
		(value: string) => {
			setCode(value);
			onCodeChange?.(value);
		},
		[setCode, onCodeChange],
	);

	const handleShiftEnter = useCallback(() => {
		if (!isExecuting) {
			execute(code);
		}
		return true;
	}, [code, execute, isExecuting]);

	return (
		<section
			{...containerProps}
			className={className}
			data-cell-id={id}
			data-executing={isExecuting}
			data-readonly={readOnly || isExecuting}
			aria-label={"Code editor"}
			aria-readonly={readOnly || isExecuting}
			aria-busy={isExecuting}
		>
			<CodeMirror
				value={code}
				onChange={handleChange}
				extensions={[
					python(),
					Prec.high(
						keymap.of([
							{
								key: "Mod-Enter",
								run: handleShiftEnter,
							},
						]),
					),
				]}
				readOnly={readOnly || isExecuting}
				basicSetup={{
					lineNumbers: true,
					highlightActiveLineGutter: true,
					highlightActiveLine: true,
					foldGutter: true,
					bracketMatching: true,
					closeBrackets: true,
					autocompletion: true,
					indentOnInput: true,
				}}
				{...editorProps}
			/>
		</section>
	);
}
