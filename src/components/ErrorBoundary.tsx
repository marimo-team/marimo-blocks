import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode | ((error: Error) => ReactNode);
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	className?: string;
	errorClassName?: string;
}

interface State {
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.props.onError?.(error, errorInfo);
	}

	render() {
		const { error } = this.state;
		const { children, fallback, className, errorClassName } = this.props;

		if (error) {
			if (typeof fallback === "function") {
				return fallback(error);
			}
			return (
				fallback || (
					<section className={errorClassName} aria-label="Error message">
						<h2>Something went wrong</h2>
						<pre>{error.message}</pre>
					</section>
				)
			);
		}

		return <div className={className}>{children}</div>;
	}
}
