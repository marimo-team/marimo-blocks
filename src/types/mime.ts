import type { ReactNode } from "react";

export interface MimeOutput {
	type: string;
	data: unknown;
}

export interface MimeRenderer {
	/** MIME type this renderer can handle (e.g. "text/plain", "image/*") */
	mimeType: string | RegExp;
	/** Priority of this renderer (higher numbers take precedence) */
	priority?: number;
	/** Render the MIME output */
	render: (data: unknown) => ReactNode;
}

export interface MimeRendererProps {
	/** Custom MIME renderers to override or extend defaults */
	renderers?: MimeRenderer[];
}

// Default supported MIME types
export const MIME_TYPES = {
	TEXT: "text/plain",
	HTML: "text/html",
	MARKDOWN: "text/markdown",
	LATEX: "text/latex",
	SVG: "image/svg+xml",
	PNG: "image/png",
	JPEG: "image/jpeg",
	GIF: "image/gif",
	JSON: "application/json",
	JAVASCRIPT: "application/javascript",
	ERROR: "application/vnd.marimo.error",
} as const;

export type MimeType = (typeof MIME_TYPES)[keyof typeof MIME_TYPES];
