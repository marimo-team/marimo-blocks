interface Logger {
	warn: (...args: unknown[]) => void;
	error: (...args: unknown[]) => void;
	info: (...args: unknown[]) => void;
	debug: (...args: unknown[]) => void;
}

// Simple logger that wraps console
// Can be extended later to support different environments/configurations
export const logger: Logger = {
	warn: (...args) => console.warn(...args),
	error: (...args) => console.error(...args),
	info: (...args) => console.info(...args),
	debug: (...args) => console.debug(...args),
};
