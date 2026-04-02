import { describe, expect, test } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("ExplainCodeElement source", () => {
	const source = readFileSync(
		join(__dirname, "explain-code-sheet.ts"),
		"utf-8",
	);

	test("imports sheet component", () => {
		expect(source).toContain('import "../sheet/sheet"');
	});

	test("exports ExplainCodeElement class", () => {
		expect(source).toContain("class ExplainCodeElement extends HTMLElement");
		expect(source).toContain("export { ExplainCodeElement }");
	});

	test("registers custom element with cfdocs-explain-code tag", () => {
		expect(source).toContain('customElements.define("cfdocs-explain-code"');
	});

	test("implements connectedCallback", () => {
		expect(source).toContain("connectedCallback()");
	});

	test("implements disconnectedCallback with abort", () => {
		expect(source).toContain("disconnectedCallback()");
		expect(source).toContain("this.abortController?.abort()");
	});

	test("reads code-block-position attribute", () => {
		expect(source).toContain('getAttribute("code-block-position")');
	});

	test("creates cfdocs-sheet element", () => {
		expect(source).toContain("<cfdocs-sheet></cfdocs-sheet>");
	});

	test("listens for sheet-close event", () => {
		expect(source).toContain('addEventListener("sheet-close"');
	});

	test("shows loading state initially", () => {
		expect(source).toContain("LOADING_HTML");
		expect(source).toContain("loading-skeleton");
		expect(source).toContain("skeleton-line");
	});

	test("implements fetchExplanation method", () => {
		expect(source).toContain("async fetchExplanation()");
	});

	test("uses AbortController for fetch cancellation", () => {
		expect(source).toContain("new AbortController()");
		expect(source).toContain("signal: this.abortController.signal");
	});

	test("checks cf-docs-finish-reason header", () => {
		expect(source).toContain('headers.get("cf-docs-finish-reason")');
		expect(source).toContain('finishReason !== "stop"');
	});

	test("handles AbortError silently", () => {
		expect(source).toContain('(error as Error).name === "AbortError"');
		expect(source).toContain("return;");
	});

	test("shows error state on failure", () => {
		expect(source).toContain("ERROR_HTML");
		expect(source).toContain("error-state");
	});

	test("has success HTML with explanation content", () => {
		expect(source).toContain("getSuccessHtml(explanation: string)");
		expect(source).toContain("explanation-content");
	});

	test("includes disclaimer", () => {
		expect(source).toContain("sheet-disclaimer");
		expect(source).toContain("experimental and may produce incorrect answers");
	});

	test("uses PUBLIC_EXPLAIN_CODE_API_URL env var with fallback", () => {
		expect(source).toContain("PUBLIC_EXPLAIN_CODE_API_URL");
		expect(source).toContain("docs-ai-production.cloudflare-docs.workers.dev");
	});

	test("builds correct API URL with path and codeBlock", () => {
		expect(source).toContain("window.location.pathname");
		expect(source).toContain("/explain/");
		expect(source).toContain("codeBlock=");
	});

	test("includes styles inline in content HTML", () => {
		expect(source).toContain("<style>${EXPLAIN_CODE_STYLES}</style>");
	});

	test("includes required CSS classes", () => {
		expect(source).toContain(".sheet-title");
		expect(source).toContain(".explanation-content");
		expect(source).toContain(".loading-skeleton");
		expect(source).toContain(".error-state");
		expect(source).toContain(".sheet-disclaimer");
	});
});
