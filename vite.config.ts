import { defineConfig } from "vitest/config";

export default defineConfig({
	root: process.env.VITEST ? "." : "demo",
	base: "/marimo-blocks/",
});
