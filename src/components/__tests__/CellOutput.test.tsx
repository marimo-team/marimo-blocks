import { render, screen } from "@testing-library/react";
import { createStore, Provider } from "jotai";
import { MIME_TYPES } from "../../types/mime";
import { CellOutput, convertToMimeOutput } from "../CellOutput";
import { PyodideInterface } from "pyodide";
import { vi, describe, it, expect, Mocked, beforeAll } from "vitest";
import { CellOutputAtoms } from "../../state";
import { logger } from "../../utils/logger";

// Mock the useMimeRenderer hook
vi.mock("../hooks/useMimeRenderer", () => ({
	useMimeRenderer: () => ({
		renderOutput: (output: any) => output.data,
	}),
}));

beforeAll(() => {
	logger.warn = vi.fn();
});

describe("CellOutput", () => {
	const defaultProps = {
		id: "test-cell",
	};

	it("renders nothing when no outputs", () => {
		render(
			<Provider>
				<CellOutput {...defaultProps} />
			</Provider>,
		);
		expect(screen.queryByRole("region")).toBeNull();
	});

	it("renders text output", () => {
		const outputs = [{ type: MIME_TYPES.TEXT, data: "Hello World" }];
		const store = createStore();
		store.set(CellOutputAtoms.get(defaultProps.id), outputs);
		render(
			<Provider store={store}>
				<CellOutput {...defaultProps} />
			</Provider>,
		);

		const section = screen.getAllByRole("region")[0];
		expect(section).toHaveAttribute("data-cell-id", defaultProps.id);
		expect(section).toHaveAttribute("data-output-count", "1");
		expect(screen.getByText("Hello World")).toBeInTheDocument();
	});

	it("renders multiple outputs", () => {
		const outputs = [
			{ type: MIME_TYPES.TEXT, data: "First output" },
			{ type: MIME_TYPES.TEXT, data: "Second output" },
		];
		const store = createStore();
		store.set(CellOutputAtoms.get(defaultProps.id), outputs);
		render(
			<Provider store={store}>
				<CellOutput {...defaultProps} />
			</Provider>,
		);

		expect(screen.getByText("First output")).toBeInTheDocument();
		expect(screen.getByText("Second output")).toBeInTheDocument();
	});

	it("applies custom className and outputItemClassName", () => {
		const store = createStore();
		const outputs = [{ type: MIME_TYPES.TEXT, data: "Test" }];
		store.set(CellOutputAtoms.get(defaultProps.id), outputs);
		render(
			<Provider store={store}>
				<CellOutput
					{...defaultProps}
					className="container-class"
					outputItemClassName="item-class"
				/>
			</Provider>,
		);

		const section = screen.getAllByRole("region")[0];
		expect(section).toHaveClass("container-class");
		expect(screen.getByText("Test").parentElement).toHaveClass("item-class");
	});

	it("uses custom renderOutputLabel", () => {
		const outputs = [{ type: MIME_TYPES.TEXT, data: "Test" }];
		const customLabel = "Custom Label";
		const store = createStore();
		store.set(CellOutputAtoms.get(defaultProps.id), outputs);
		render(
			<Provider store={store}>
				<CellOutput {...defaultProps} renderOutputLabel={() => customLabel} />
			</Provider>,
		);

		const outputItem = screen.getByText("Test").parentElement;
		expect(outputItem).toHaveAttribute("aria-label", customLabel);
	});
});

describe("convertToMimeOutput", () => {
	const mockPyodide = {
		runPython: vi.fn().mockReturnValue([MIME_TYPES.TEXT, "Console output"]),
	} as unknown as Mocked<PyodideInterface>;

	it("converts stdout to text", () => {
		const result = convertToMimeOutput(mockPyodide, "stdout", "Console output");
		expect(result).toEqual({
			type: MIME_TYPES.TEXT,
			data: "Console output",
		});
	});

	it("converts stderr to text", () => {
		const result = convertToMimeOutput(mockPyodide, "stderr", "Error output");
		expect(result).toEqual({
			type: MIME_TYPES.TEXT,
			data: "Error output",
		});
	});

	it("converts error to error type", () => {
		const result = convertToMimeOutput(mockPyodide, "error", "Error message");
		expect(result).toEqual({
			type: MIME_TYPES.ERROR,
			data: "Error message",
		});
	});

	it("uses provided mime type for result", () => {
		const result = convertToMimeOutput(mockPyodide, "result", { data: "test" }, "application/json");
		expect(result).toEqual({
			type: "application/json",
			data: { data: "test" },
		});
	});

	it("falls back to text for result without mime detection", () => {
		mockPyodide.runPython.mockImplementation(() => {
			throw new Error("Python error");
		});

		const result = convertToMimeOutput(mockPyodide, "result", "Plain text");
		expect(result).toEqual({
			type: MIME_TYPES.TEXT,
			data: "Plain text",
		});
	});

	it("handles JSON conversion in Python result", () => {
		mockPyodide.runPython.mockReturnValue(["application/json", '{"key":"value"}']);

		const result = convertToMimeOutput(mockPyodide, "result", { key: "value" });
		expect(result).toEqual({
			type: "application/json",
			data: { key: "value" },
		});
	});
});
