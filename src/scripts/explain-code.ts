const sheets = new Map<string, HTMLDivElement>();
const sheetListeners = new WeakMap<
	HTMLElement,
	{
		closeButton: () => void;
		escapeKey: (e: KeyboardEvent) => void;
	}
>();
let clickHandler: ((e: MouseEvent) => void) | null = null;

function initExplainCodeButtons() {
	// Remove existing handler if present
	if (clickHandler) {
		document.body.removeEventListener("click", clickHandler);
	}

	// Create new click handler
	clickHandler = (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		const button = target.closest<HTMLButtonElement>(
			"button[data-sheet-trigger]",
		);

		if (!button) return;

		e.preventDefault();
		e.stopPropagation();

		const sheetId = button.dataset.sheetTrigger;
		const codeContent = button.dataset.codeContent;
		const codeLanguage = button.dataset.codeLanguage;

		if (!sheetId || !codeContent) return;

		let sheet = sheets.get(sheetId);

		if (!sheet) {
			sheet = createSheet(sheetId, codeContent, codeLanguage || "text");
			document.body.appendChild(sheet);
			initSheet(sheet);
			sheets.set(sheetId, sheet);
		}

		openSheet(sheet);
	};

	// Attach the new handler
	document.body.addEventListener("click", clickHandler);
}

function cleanup() {
	// Remove click handler
	if (clickHandler) {
		document.body.removeEventListener("click", clickHandler);
		clickHandler = null;
	}

	// Restore body overflow in case a sheet was open
	document.body.style.overflow = "";
}

function createSheet(
	id: string,
	codeContent: string,
	language: string,
	side: "top" | "right" | "bottom" | "left" = "right",
): HTMLDivElement {
	const container = document.createElement("div");
	container.className = "sheet-container";
	container.dataset.sheetId = id;

	const content = document.createElement("div");

	// Base classes
	let className =
		"sheet-content fixed z-50 gap-4 bg-[var(--sl-color-bg)] p-6 transition ease-in-out overflow-y-auto";
	let boxShadow = "";

	// Add side-specific positioning, border, and shadow
	switch (side) {
		case "right":
			className +=
				" inset-y-0 right-0 h-full w-3/4 sm:max-w-sm border-l border-[var(--sl-color-gray-5)]";
			boxShadow = "-4px 0 12px rgba(0, 0, 0, 0.15)";
			break;
		case "left":
			className +=
				" inset-y-0 left-0 h-full w-3/4 sm:max-w-sm border-r border-[var(--sl-color-gray-5)]";
			boxShadow = "4px 0 12px rgba(0, 0, 0, 0.15)";
			break;
		case "top":
			className +=
				" inset-x-0 top-0 w-full h-3/4 sm:max-h-96 border-b border-[var(--sl-color-gray-5)]";
			boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
			break;
		case "bottom":
			className +=
				" inset-x-0 bottom-0 w-full h-3/4 sm:max-h-96 border-t border-[var(--sl-color-gray-5)]";
			boxShadow = "0 -4px 12px rgba(0, 0, 0, 0.15)";
			break;
	}

	content.className = className;
	content.style.boxShadow = boxShadow;
	content.dataset.side = side;
	content.dataset.state = "closed";
	content.setAttribute("role", "dialog");
	content.setAttribute("aria-modal", "true");
	content.setAttribute("aria-labelledby", `${id}-title`);
	content.setAttribute("aria-describedby", `${id}-description`);

	const closeButton = document.createElement("button");
	closeButton.type = "button";
	closeButton.className =
		"sheet-close sticky top-0 right-0 ml-auto mb-4 rounded-sm opacity-70 ring-offset-[var(--sl-color-bg)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--sl-color-text-accent)] focus:ring-offset-2 disabled:pointer-events-none z-10 bg-[var(--sl-color-bg)] flex items-center justify-center";
	closeButton.style.float = "right";
	closeButton.style.width = "2rem";
	closeButton.style.height = "2rem";
	closeButton.setAttribute("aria-label", "Close");
	closeButton.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4">
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
	`;

	const title = document.createElement("h2");
	title.id = `${id}-title`;
	title.className = "text-lg font-semibold mb-2";
	title.textContent = "Code Explanation";

	const description = document.createElement("p");
	description.id = `${id}-description`;
	description.className = "text-sm text-[var(--sl-color-gray-2)] mb-4";
	description.textContent = `Explaining ${language} code snippet`;

	const explanationText = document.createElement("div");
	explanationText.className =
		"text-sm text-[var(--sl-color-gray-2)] p-4 bg-[var(--sl-color-gray-6)] rounded overflow-auto";
	explanationText.innerHTML = `
		<p class="mb-4">This feature would integrate with an AI service to provide code explanations. The AI would analyze the code structure, identify key patterns, and explain what the code does in plain language.</p>

		<p class="mb-4">When connected to an AI service, this panel would display a comprehensive breakdown of the code snippet, including:</p>

		<ul class="list-disc list-inside mb-4 space-y-2">
			<li>An overview of what the code accomplishes</li>
			<li>Explanation of key functions and their purposes</li>
			<li>Description of important variables and data structures</li>
			<li>Analysis of any algorithms or design patterns used</li>
			<li>Potential use cases and applications</li>
			<li>Common pitfalls or edge cases to be aware of</li>
		</ul>

		<p class="mb-4">The explanation would be tailored to the programming language and complexity level of the code. For beginners, it would provide more context and foundational concepts. For advanced users, it would focus on optimization opportunities, best practices, and architectural considerations.</p>

		<p class="mb-4">Additionally, the AI could highlight specific lines of code and explain their role in the overall logic flow. It might suggest improvements, identify potential bugs, or recommend alternative approaches that could make the code more efficient or maintainable.</p>

		<p class="mb-4">This type of interactive code explanation can be particularly valuable for learning new frameworks, understanding legacy codebases, or quickly getting up to speed with unfamiliar code patterns. It serves as an on-demand coding mentor that's available whenever you need clarification.</p>

		<p class="text-xs opacity-70 mt-6">Note: This is a placeholder with extended content for testing purposes. Connect to your preferred AI service to enable real explanations.</p>
	`;

	const disclaimer = document.createElement("div");
	disclaimer.className =
		"flex items-start gap-3 p-4 mt-4 rounded bg-[var(--sl-color-orange-low)] border border-[var(--sl-color-orange)] text-sm text-[var(--sl-color-text)]";
	disclaimer.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5" style="color: var(--sl-color-orange);">
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
			<line x1="12" y1="9" x2="12" y2="13"/>
			<line x1="12" y1="17" x2="12.01" y2="17"/>
		</svg>
		<div>
			<p>Explain Code is experimental and may produce incorrect answers. Always verify the output before executing.</p>
		</div>
	`;

	content.appendChild(closeButton);
	content.appendChild(title);
	content.appendChild(description);
	content.appendChild(explanationText);
	content.appendChild(disclaimer);

	container.appendChild(content);

	return container;
}

function showError(container: HTMLElement, errorMessage: string) {
	const content = container.querySelector(".sheet-content") as HTMLElement;
	if (!content) return;

	// Remove existing error if present
	const existingError = content.querySelector(".error-state");
	if (existingError) {
		existingError.remove();
	}

	// Create error state element
	const errorState = document.createElement("div");
	errorState.className =
		"error-state flex items-start gap-3 p-4 mt-4 rounded bg-[var(--sl-color-red-low)] border border-[var(--sl-color-red)] text-sm text-[var(--sl-color-text)]";
	errorState.innerHTML = `
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="flex-shrink-0 mt-0.5" style="color: var(--sl-color-red);">
			<circle cx="12" cy="12" r="10"/>
			<line x1="12" y1="8" x2="12" y2="12"/>
			<line x1="12" y1="16" x2="12.01" y2="16"/>
		</svg>
		<div>
			<p>${errorMessage}</p>
		</div>
	`;

	// Insert error after the explanation text
	const explanationText = content.querySelector(
		".text-sm.text-\\[var\\(--sl-color-gray-2\\)\\].p-4",
	);
	if (explanationText && explanationText.nextSibling) {
		content.insertBefore(errorState, explanationText.nextSibling);
	} else {
		content.appendChild(errorState);
	}
}

function initSheet(container: HTMLElement) {
	const content = container.querySelector(".sheet-content") as HTMLElement;
	const closeButton = container.querySelector(".sheet-close");

	if (!content) return;

	// Check if listeners already exist for this sheet
	if (sheetListeners.has(content)) return;

	function closeSheet() {
		const side = content.dataset.side || "right";
		const slideInClass = `slide-in-from-${side}`;
		const slideOutClass = `slide-out-to-${side}`;

		// Remove opening animation classes and add closing ones
		content.classList.remove("animate-in", slideInClass);
		content.classList.add("animate-out", slideOutClass);

		// Wait for animation to complete before hiding
		setTimeout(() => {
			content.dataset.state = "closed";
			content.classList.remove("animate-out", slideOutClass);
		}, 300);

		document.body.style.overflow = "";
	}

	// Create listener functions that can be removed later
	const closeButtonHandler = () => closeSheet();
	const escapeKeyHandler = (e: KeyboardEvent) => {
		if (e.key === "Escape" && content.dataset.state === "open") {
			closeSheet();
		}
	};

	// Store listener references for potential cleanup
	sheetListeners.set(content, {
		closeButton: closeButtonHandler,
		escapeKey: escapeKeyHandler,
	});

	// Attach listeners
	closeButton?.addEventListener("click", closeButtonHandler);
	document.addEventListener("keydown", escapeKeyHandler);
}

function openSheet(container: HTMLElement) {
	const content = container.querySelector(".sheet-content") as HTMLElement;

	if (!content) return;

	content.dataset.state = "open";

	const side = content.dataset.side || "right";
	const slideInClass = `slide-in-from-${side}`;

	// Add animation classes
	content.classList.add("animate-in", slideInClass);

	const firstFocusable = content.querySelector(
		'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
	) as HTMLElement;
	firstFocusable?.focus();
}

// Clean up before Astro swaps pages (view transitions)
document.addEventListener("astro:before-swap", () => {
	cleanup();
});

// Initialize on every page load (works with view transitions)
document.addEventListener("astro:page-load", () => {
	initExplainCodeButtons();
});

// Fallback for non-Astro environments or initial page load
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", () => {
		initExplainCodeButtons();
	});
} else {
	// DOM already loaded, initialize immediately
	initExplainCodeButtons();
}
