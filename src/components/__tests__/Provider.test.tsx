import { render, screen, waitFor } from "@testing-library/react";
import { loadPyodide } from "pyodide";
import { describe, expect, it, vi } from "vitest";
import { Provider, usePyodide } from "../Provider";

// Mock pyodide
vi.mock("pyodide", async (importOriginal) => ({
	...(await importOriginal()),
	loadPyodide: vi.fn().mockResolvedValue({
		loadPackage: vi.fn(),
		runPython: vi.fn(),
		FS: {
			mkdir: vi.fn(),
			readFile: vi.fn(),
			writeFile: vi.fn(),
		},
		runPythonAsync: vi.fn(),
	}),
}));

function TestComponent() {
	const { loading, error } = usePyodide();
	return (
		<div>
			{loading && <div>Loading...</div>}
			{error && <div>Error: {error.message}</div>}
			{!loading && !error && <div>Ready</div>}
		</div>
	);
}

describe("Provider", () => {
	it("should load pyodide and provide context", async () => {
		const onReady = vi.fn();
		render(
			<Provider onReady={onReady}>
				<TestComponent />
			</Provider>,
		);

		// Should show loading initially
		expect(screen.getByText("Loading...")).toBeInTheDocument();

		// Should show ready after loading
		await waitFor(() => {
			expect(screen.getByText("Ready")).toBeInTheDocument();
		});

		// Should call onReady
		expect(onReady).toHaveBeenCalled();
	});

	it("should handle errors", async () => {
		const error = new Error("Failed to load");
		vi.mocked(loadPyodide).mockRejectedValueOnce(error);

		const onError = vi.fn();
		render(
			<Provider onError={onError}>
				<TestComponent />
			</Provider>,
		);

		// Should show error
		await waitFor(() => {
			expect(screen.getByText(`Error: ${error.message}`)).toBeInTheDocument();
		});

		// Should call onError
		expect(onError).toHaveBeenCalledWith(error);
	});
});
