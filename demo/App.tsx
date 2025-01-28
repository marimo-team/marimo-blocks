import { JsonViewer } from "@textea/json-viewer";
import React from "react";
import { useState } from "react";
import {
	CellEditor,
	CellOutput,
	CellRunButton,
	NotebookRunButton,
	Provider,
	usePyodide,
} from "../src/index";
import "./demo.css";

let id = 1;

const INITIAL_CELLS = [
	{
		id: `cell${id++}`,
		code: `import numpy as np
print("[demo] Hello from cell 1!")
np.random.rand(5)`,
	},
	{
		id: `cell${id++}`,
		code: `data = {"hello": "world", "numbers": [1, 2, 3]}
data`,
	},
	{
		id: `cell${id++}`,
		code: `# HTML output
html = """
<div style="padding: 20px; background: #f0f0f0; border-radius: 5px;">
  <h2 style="color: #333;">HTML Test</h2>
  <p>This is <strong>formatted</strong> <em>HTML</em> content!</p>
</div>
"""
("text/html", html)`,
	},
	{
		id: `cell${id++}`,
		code: `# Audio output - generate a simple sine wave
import numpy as np
sample_rate = 44100
duration = 2
t = np.linspace(0, duration, int(sample_rate * duration))
audio_data = np.sin(2 * np.pi * 440 * t)  # 440 Hz sine wave
("audio/wav", audio_data.tobytes())`,
	},
	{
		id: `cell${id++}`,
		code: `# Plain text output with formatting
text = '''
This is a plain text output
with multiple lines
  and preserved formatting
    - bullet point 1
    - bullet point 2
'''
print(text)`,
	},
	{
		id: `cell${id++}`,
		code: `# Error output test
raise ValueError("This is a test error message!")`,
	},
	{
		id: `cell${id++}`,
		code: `import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [1, 4, 9])
plt.title("A simple plot")
plt.show()`,
	},
];

function App() {
	const [cells] = useState(INITIAL_CELLS);

	return (
		<div className="app">
			<Provider
				dependencies={["numpy", "matplotlib"]}
				onReady={() => console.log("[demo] Pyodide ready!")}
				renderers={[
					{
						mimeType: "application/json",
						priority: 1,
						render: (data) => (
							<JsonViewer
								value={data}
								theme="dark"
								displayDataTypes={false}
								enableClipboard={true}
							/>
						),
					},
				]}
			>
				<div className="loading-indicator h-10">
					<LoadingIndicator />
				</div>
				<div className="notebook">
					{cells.map((cell) => (
						<div key={cell.id} className="cell">
							<div className="cell-header">
								<span className="cell-id">Cell {cell.id}</span>
								<CellRunButton
									id={cell.id}
									onExecutionComplete={(error) => {
										// biome-ignore lint/suspicious/noConsole: <explanation>
										if (error) console.error(`Cell ${cell.id} failed:`, error);
									}}
								>
									{({ isRunning }) => (isRunning ? <div>Running...</div> : <div>Run</div>)}
								</CellRunButton>
							</div>
							<CellEditor
								id={cell.id}
								code={cell.code}
								onChange={(code) => console.log(`[demo] Cell ${cell.id} changed:`, code)}
							/>
							<CellOutput id={cell.id} />
						</div>
					))}

					<div className="notebook-controls">
						<NotebookRunButton
							onExecutionComplete={() => console.log("[demo] All cells executed!")}
						/>
					</div>
				</div>
			</Provider>
		</div>
	);
}

const LoadingIndicator = () => {
	const content = usePyodide();

	if (content.loading) {
		return <div>Loading...</div>;
	}

	if (content.error) {
		return <div>Error: {content.error.message}</div>;
	}

	return null;
};

export default App;
