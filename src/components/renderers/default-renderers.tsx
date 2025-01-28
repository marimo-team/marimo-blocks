import DOMPurify from "dompurify";
import type { MimeRenderer } from "../../types/mime";
import { MIME_TYPES } from "../../types/mime";

interface RendererProps {
	className?: string;
}

// Text renderer (fallback for any text/* type)
export const textRenderer: MimeRenderer = {
	mimeType: /^text\/.+/,
	priority: 0,
	render: (data, { className }: RendererProps = {}) => (
		<pre className={className}>{String(data)}</pre>
	),
};

// HTML renderer
export const htmlRenderer: MimeRenderer = {
	mimeType: MIME_TYPES.HTML,
	priority: 0,
	render: (data, { className }: RendererProps = {}) => (
		<section
			className={className}
			ref={(el) => {
				if (el) el.innerHTML = DOMPurify.sanitize(String(data));
			}}
			aria-label="HTML output"
		/>
	),
};

// Image renderer (handles all image/* types)
export const imageRenderer: MimeRenderer = {
	mimeType: /^image\/.+/,
	priority: 0,
	render: (data, { className }: RendererProps = {}) => {
		const src = typeof data === "string" ? data : URL.createObjectURL(data as Blob);
		return (
			<img
				className={className}
				src={src}
				alt="Cell output"
				onLoad={() => {
					if (typeof data !== "string") {
						URL.revokeObjectURL(src);
					}
				}}
			/>
		);
	},
};

// Video renderer
export const videoRenderer: MimeRenderer = {
	mimeType: /^video\/.+/,
	priority: 0,
	// biome-ignore lint/a11y/useMediaCaption: <explanation>
	render: (data) => <video className="video-output" src={data as string} controls />,
};

// Audio renderer
export const audioRenderer: MimeRenderer = {
	mimeType: /^audio\/.+/,
	priority: 0,
	// biome-ignore lint/a11y/useMediaCaption: <explanation>
	render: (data) => <audio className="audio-output" src={data as string} controls />,
};

// JSON renderer
export const jsonRenderer: MimeRenderer = {
	mimeType: MIME_TYPES.JSON,
	priority: 0,
	render: (data, { className }: RendererProps = {}) => (
		<pre className={className}>{JSON.stringify(data, null, 2)}</pre>
	),
};

// Error renderer
export const errorRenderer: MimeRenderer = {
	mimeType: MIME_TYPES.ERROR,
	priority: 0,
	render: (data, { className }: RendererProps = {}) => (
		<div className={className} aria-live="assertive">
			<pre>{data instanceof Error ? data.message : String(data)}</pre>
		</div>
	),
};

// Default renderers in priority order
export const defaultRenderers: MimeRenderer[] = [
	errorRenderer,
	htmlRenderer,
	imageRenderer,
	videoRenderer,
	audioRenderer,
	jsonRenderer,
	textRenderer,
];
