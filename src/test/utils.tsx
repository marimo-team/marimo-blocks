import { render as rtlRender } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";
import type React from "react";
import { Provider } from "../components/Provider";
import type { ProviderProps } from "../types/provider";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	providerProps?: Omit<ProviderProps, "children">;
}

function render(
	ui: ReactElement,
	{ providerProps = {}, ...renderOptions }: CustomRenderOptions = {},
): ReturnType<typeof rtlRender> {
	function Wrapper({ children }: { children: React.ReactNode }) {
		return <Provider {...providerProps}>{children}</Provider>;
	}
	return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from "@testing-library/react";
export { render };
