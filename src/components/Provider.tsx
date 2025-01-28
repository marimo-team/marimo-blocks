import { Provider as JotaiProvider } from "jotai";
import { type PyodideInterface, loadPyodide, version } from "pyodide";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { initUtils } from "../python/mime_utils";
import type { MimeRenderer } from "../types/mime";
import type { ProviderProps, PyodideContextType } from "../types/provider";
import { invariant } from "../utils/utils";
import { ErrorBoundary } from "./ErrorBoundary";

const DEFAULT_PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;

const PyodideContext = createContext<PyodideContextType | null>(null);
const RendererContext = createContext<MimeRenderer[]>([]);

function PyodideProvider({
	children,
	pyodideUrl = DEFAULT_PYODIDE_URL,
	dependencies = [],
	renderers = [],
	onReady,
	onError,
}: ProviderProps) {
	const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function init() {
			try {
				const pyodide = await loadPyodide({
					indexURL: pyodideUrl,
				});

				await initUtils(pyodide);
				setPyodide(pyodide);
				setLoading(false);
				onReady?.();
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				onError?.(error);
			}
		}
		init();
	}, [pyodideUrl, onReady, onError]);

	useEffect(() => {
		if (!pyodide || loading || error || dependencies.length === 0) {
			return;
		}

		async function installDependencies() {
			try {
				invariant(pyodide !== null, "Pyodide not initialized");
				await pyodide.loadPackage(dependencies);
			} catch (err) {
				const error = err instanceof Error ? err : new Error(String(err));
				setError(error);
				onError?.(error);
			}
		}
		installDependencies();
	}, [pyodide, loading, error, dependencies, onError]);

	const value = useMemo<PyodideContextType>(
		() => ({
			pyodide,
			loading,
			error,
			installPackage: async (pkg: string) => {
				invariant(pyodide !== null, "Pyodide not initialized");
				await pyodide.loadPackage(pkg);
			},
			runPython: async (code: string) => {
				invariant(pyodide !== null, "Pyodide not initialized");
				await pyodide.loadPackagesFromImports(code);
				return await pyodide.runPythonAsync(code);
			},
		}),
		[pyodide, loading, error],
	);

	return (
		<JotaiProvider>
			<PyodideContext.Provider value={value}>
				<RendererContext.Provider value={renderers}>{children}</RendererContext.Provider>
			</PyodideContext.Provider>
		</JotaiProvider>
	);
}

const DEFAULT_ERROR_FALLBACK = (error: Error) => (
	<div className="pyodide-error">
		<h2>Failed to initialize Pyodide</h2>
		<pre>{error.message}</pre>
	</div>
);

export function Provider(props: ProviderProps) {
	const {
		errorContainerProps,
		errorHeadingProps,
		errorMessageProps,
		errorFallback = DEFAULT_ERROR_FALLBACK,
		...rest
	} = props;

	return (
		<ErrorBoundary onError={props.onError} fallback={errorFallback}>
			<PyodideProvider {...rest} />
		</ErrorBoundary>
	);
}

export function usePyodide() {
	const context = useContext(PyodideContext);
	if (!context) {
		throw new Error("usePyodide must be used within a Provider");
	}
	return context;
}

export function useRenderers() {
	return useContext(RendererContext);
}
