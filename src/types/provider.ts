import type { PyodideInterface } from "pyodide";
import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import type { MimeRenderer } from "./mime";

export interface ProviderProps extends PropsWithChildren {
	/**
	 * URL to load Pyodide from
	 * @default "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/"
	 */
	pyodideUrl?: string;
	/**
	 * Python packages to install
	 * @default []
	 */
	dependencies?: string[];
	/**
	 * Mime renderers to use. Will be combined with default renderers.
	 */
	renderers?: MimeRenderer[];
	/**
	 * Called when Pyodide is loaded and ready
	 */
	onReady?: () => void;
	/**
	 * Called when there is an error loading Pyodide
	 */
	onError?: (error: Error) => void;
	/**
	 * Props to pass to the error container element
	 */
	errorContainerProps?: HTMLAttributes<HTMLDivElement>;
	/**
	 * Props to pass to the error heading element
	 */
	errorHeadingProps?: HTMLAttributes<HTMLHeadingElement>;
	/**
	 * Props to pass to the error message element
	 */
	errorMessageProps?: HTMLAttributes<HTMLPreElement>;
	/**
	 * Custom error fallback component
	 */
	errorFallback?: (error: Error) => ReactNode;
}

export interface PyodideContextType {
	/** The Pyodide instance */
	pyodide: PyodideInterface | null;
	/** Whether Pyodide is loading */
	loading: boolean;
	/** Error loading Pyodide */
	error: Error | null;
	/** Install Python packages */
	installPackage: (pkg: string) => Promise<void>;
	/** Run Python code */
	runPython: (code: string) => Promise<unknown>;
}
