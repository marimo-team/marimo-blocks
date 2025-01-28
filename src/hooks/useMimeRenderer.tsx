import { useMemo } from "react";
import { defaultRenderers } from "../components/renderers/default-renderers";
import type { MimeOutput, MimeRenderer } from "../types/mime";

export function useMimeRenderer(customRenderers: MimeRenderer[] = []) {
	const renderers = useMemo(() => {
		// Combine default and custom renderers, sorted by priority
		return [...defaultRenderers, ...customRenderers].sort(
			(a, b) => (b.priority ?? 0) - (a.priority ?? 0),
		);
	}, [customRenderers]);

	const findRenderer = (mimeType: string) => {
		return renderers.find((renderer) => {
			if (renderer.mimeType instanceof RegExp) {
				return renderer.mimeType.test(mimeType);
			}
			return renderer.mimeType === mimeType;
		});
	};

	const renderOutput = (output: MimeOutput) => {
		const renderer = findRenderer(output.type);
		if (!renderer) {
			// Fallback to string representation
			return <pre>{String(output.data)}</pre>;
		}
		return renderer.render(output.data);
	};

	return {
		renderers,
		findRenderer,
		renderOutput,
	};
}
