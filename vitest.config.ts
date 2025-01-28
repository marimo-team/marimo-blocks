import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		setupFiles: ["./src/test/setup.ts"],
		include: ["src/**/*.test.{ts,tsx}"],
		coverage: {
			enabled: true,
			include: ["src/**"],
			exclude: ["demo/**", "scripts/**", "**/__tests__/**"],
			reportOnFailure: true,
			reporter: ["text", "html", "json-summary", "json"],
		},
		globals: true,
	},
});
