import { describe, expect, test } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("SheetElement source", () => {
	const sheetSource = readFileSync(join(__dirname, "sheet.ts"), "utf-8");

	test("exports SheetElement class", () => {
		expect(sheetSource).toContain("class SheetElement extends HTMLElement");
		expect(sheetSource).toContain("export { SheetElement }");
	});

	test("registers custom element with cfdocs-sheet tag", () => {
		expect(sheetSource).toContain('customElements.define("cfdocs-sheet"');
	});

	test("implements connectedCallback", () => {
		expect(sheetSource).toContain("connectedCallback()");
	});

	test("implements disconnectedCallback", () => {
		expect(sheetSource).toContain("disconnectedCallback()");
	});

	test("implements setContent method", () => {
		expect(sheetSource).toContain("setContent(html: string)");
	});

	test("implements open method with showModal", () => {
		expect(sheetSource).toContain("open()");
		expect(sheetSource).toContain("showModal()");
	});

	test("implements close method with animation", () => {
		expect(sheetSource).toContain("close()");
		expect(sheetSource).toContain('classList.add("closing")');
	});

	test("dispatches sheet-close event", () => {
		expect(sheetSource).toContain('new CustomEvent("sheet-close")');
	});

	test("handles backdrop click", () => {
		expect(sheetSource).toContain("e.target === this.dialog");
	});

	test("includes required CSS styles", () => {
		expect(sheetSource).toContain(".sheet-dialog");
		expect(sheetSource).toContain(".sheet-content");
		expect(sheetSource).toContain(".sheet-close");
		expect(sheetSource).toContain("slide-in-from-right");
		expect(sheetSource).toContain("slide-out-to-right");
	});

	test("injects styles with unique ID to prevent duplicates", () => {
		expect(sheetSource).toContain("cfdocs-sheet-styles");
		expect(sheetSource).toContain('getElementById("cfdocs-sheet-styles")');
	});

	test("prevents body scroll when open", () => {
		expect(sheetSource).toContain('document.body.style.overflow = "hidden"');
	});

	test("resets body scroll on close", () => {
		expect(sheetSource).toContain('document.body.style.overflow = ""');
	});

	test("removes self from DOM on close", () => {
		expect(sheetSource).toContain("this.remove()");
	});
});
