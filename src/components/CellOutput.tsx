import { useAtom } from "jotai";
import type { PyodideInterface } from "pyodide";
import type { HTMLAttributes } from "react";
import { useMimeRenderer } from "../hooks/useMimeRenderer";
import { CellOutputAtoms } from "../state";
import type { MimeOutput } from "../types/mime";
import { MIME_TYPES } from "../types/mime";
import { logger } from "../utils/logger";
import { useRenderers } from "./Provider";

interface CellOutputProps extends HTMLAttributes<HTMLElement> {
	/** Unique identifier for this cell */
	id: string;
	/** Class name for the output container */
	className?: string;
	/** Class name for individual output items */
	outputItemClassName?: string;
	/** Additional props to pass to individual output items */
	outputItemProps?: HTMLAttributes<HTMLElement>;
	/** Function to render the output item label (for accessibility) */
	renderOutputLabel?: (output: MimeOutput, index: number) => string;
}

const DEFAULT_RENDER_OUTPUT_LABEL = (output: MimeOutput, index: number) =>
	`Output ${index + 1} of type ${output.type}`;

export function CellOutput({
	id,
	className,
	outputItemClassName,
	outputItemProps,
	renderOutputLabel = DEFAULT_RENDER_OUTPUT_LABEL,
	...containerProps
}: CellOutputProps) {
	const [outputs] = useAtom(CellOutputAtoms.get(id));
	const renderers = useRenderers();
	const { renderOutput } = useMimeRenderer(renderers);

	if (outputs.length === 0) {
		return null;
	}

	return (
		<section
			{...containerProps}
			className={className}
			aria-label="Cell output"
			data-cell-id={id}
			data-output-count={outputs.length}
		>
			{outputs.map((output, index) => (
				<section
					key={`${id}-${output.type}-${index}`}
					{...outputItemProps}
					className={outputItemClassName}
					data-mime-type={output.type}
					aria-label={renderOutputLabel(output, index)}
				>
					{renderOutput(output)}
				</section>
			))}
		</section>
	);
}

// Helper to convert legacy output types to MIME outputs
export function convertToMimeOutput(
	pyodide: PyodideInterface,
	type: "stdout" | "stderr" | "result" | "error",
	content: string | unknown,
	mimeType?: string,
): MimeOutput {
	switch (type) {
		case "stdout":
			return { type: MIME_TYPES.TEXT, data: content };
		case "stderr":
			return { type: MIME_TYPES.TEXT, data: content };
		case "error":
			return { type: MIME_TYPES.ERROR, data: content };
		case "result": {
			// If mimeType is provided, use it directly
			if (mimeType) {
				return { type: mimeType, data: content };
			}

			try {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				(globalThis as any).result = content;

				// Convert the result using our Python utilities
				const [detectedType, convertedData] = pyodide.runPython(`
          import mime_utils
          import js
          mime_utils.convert_to_mime_data(js.result)
        `) as [string, unknown];

				// Handle converting from Python type back to JS
				let parsedData = convertedData;
				if (detectedType === "application/json" && typeof convertedData === "string") {
					parsedData = JSON.parse(convertedData);
				}

				return { type: detectedType, data: parsedData };
			} catch (err) {
				logger.warn("Failed to use Python mime detection:", err);
			}

			// Fallback to text
			return { type: MIME_TYPES.TEXT, data: content };
		}
	}
}
