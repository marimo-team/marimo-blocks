# @marimo-team/blocks

React components for building your own Python editor/notebook in the browser, powered by [marimo](https://github.com/marimo-team/marimo) and [Pyodide](https://github.com/pyodide/pyodide).

## Installation

```bash
npm install @marimo-team/blocks
# or
yarn add @marimo-team/blocks
# or
pnpm add @marimo-team/blocks
```

## Usage

```tsx
import {
  Provider as MarimoProvider,
  CellEditor,
  CellOutput,
  CellRunButton,
  NotebookRunButton,
} from "@marimo-team/blocks";

function MyNotebook() {
  return (
    <MarimoProvider
      pyodideUrl="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
      dependencies={["numpy", "pandas"]}
      onReady={() => console.log("Pyodide ready!")}
    >
      <div className="cell">
        <CellEditor
          id="cell1"
          code="import numpy as np\nnp.random.rand(10)"
          onChange={(code) => console.log("Code changed:", code)}
        />
        <CellOutput id="cell1" />
        <CellRunButton
          id="cell1"
          onExecutionComplete={(error) => {
            if (error) console.error("Execution failed:", error);
          }}
        />
      </div>

      <NotebookRunButton
        onExecutionComplete={() => console.log("All cells executed!")}
      />
    </MarimoProvider>
  );
}
```

## Components

### Provider

The root component that initializes Pyodide and provides context to child components.

### CellEditor

A code editor component built on CodeMirror with Python syntax highlighting.

### CellOutput

Displays the output of Python code execution, including stdout, stderr, and rich output types.

### CellRunButton

A button to execute a single cell's code.

### NotebookRunButton

A button to execute all cells in sequence.

## Custom Renderers

You can add custom renderers to handle specific MIME types in cell outputs. Here's an example using [@textea/json-viewer](https://www.npmjs.com/package/@textea/json-viewer) for JSON output:

```tsx
import { JsonViewer } from "@textea/json-viewer";

<MarimoProvider
  dependencies={["numpy"]}
  renderers={[
    {
      mimeType: "application/json",
      priority: 1,
      render: (data) => (
        <JsonViewer value={data} displayDataTypes={false} />
      ),
    },
  ]}
>
  {/* ... */}
</MarimoProvider>
```

## Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## License

Apache-2.0
