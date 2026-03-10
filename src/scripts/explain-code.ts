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

	const aiButtons = document.createElement("div");
	aiButtons.className = "flex flex-col gap-2 mt-4";
	aiButtons.innerHTML = `
		<button type="button" class="flex items-center justify-center gap-2 px-4 py-3 rounded bg-[var(--sl-color-gray-6)] hover:bg-[var(--sl-color-gray-5)] transition-colors text-sm font-medium border border-[var(--sl-color-gray-5)]">
			<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round">
				<path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z" fill="currentColor"/>
			</svg>
			<span>Explore with ChatGPT</span>
		</button>
		<button type="button" class="flex items-center justify-center gap-2 px-4 py-3 rounded bg-[var(--sl-color-gray-6)] hover:bg-[var(--sl-color-gray-5)] transition-colors text-sm font-medium border border-[var(--sl-color-gray-5)]">
			<svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0_2002_2)">
					<path fill-rule="evenodd" clip-rule="evenodd" d="M2.3545 7.9775L4.7145 6.654L4.7545 6.539L4.7145 6.475H4.6L4.205 6.451L2.856 6.4145L1.6865 6.366L0.5535 6.305L0.268 6.2445L0 5.892L0.0275 5.716L0.2675 5.5555L0.6105 5.5855L1.3705 5.637L2.5095 5.716L3.3355 5.7645L4.56 5.892H4.7545L4.782 5.8135L4.715 5.7645L4.6635 5.716L3.4845 4.918L2.2085 4.074L1.5405 3.588L1.1785 3.3425L0.9965 3.1115L0.9175 2.6075L1.2455 2.2465L1.686 2.2765L1.7985 2.307L2.245 2.65L3.199 3.388L4.4445 4.3045L4.627 4.4565L4.6995 4.405L4.709 4.3685L4.627 4.2315L3.9495 3.0085L3.2265 1.7635L2.9045 1.2475L2.8195 0.938C2.78711 0.819128 2.76965 0.696687 2.7675 0.5735L3.1415 0.067L3.348 0L3.846 0.067L4.056 0.249L4.366 0.956L4.867 2.0705L5.6445 3.5855L5.8725 4.0345L5.994 4.4505L6.0395 4.578H6.1185V4.505L6.1825 3.652L6.301 2.6045L6.416 1.257L6.456 0.877L6.644 0.422L7.0175 0.176L7.3095 0.316L7.5495 0.6585L7.516 0.8805L7.373 1.806L7.0935 3.2575L6.9115 4.2285H7.0175L7.139 4.1075L7.6315 3.4545L8.4575 2.4225L8.8225 2.0125L9.2475 1.5605L9.521 1.345H10.0375L10.4175 1.9095L10.2475 2.4925L9.7155 3.166L9.275 3.737L8.643 4.587L8.248 5.267L8.2845 5.322L8.3785 5.312L9.8065 5.009L10.578 4.869L11.4985 4.7115L11.915 4.9055L11.9605 5.103L11.7965 5.5065L10.812 5.7495L9.6575 5.9805L7.938 6.387L7.917 6.402L7.9415 6.4325L8.716 6.5055L9.047 6.5235H9.858L11.368 6.636L11.763 6.897L12 7.216L11.9605 7.4585L11.353 7.7685L10.533 7.574L8.6185 7.119L7.9625 6.9545H7.8715V7.0095L8.418 7.5435L9.421 8.4485L10.6755 9.6135L10.739 9.9025L10.578 10.13L10.408 10.1055L9.3055 9.277L8.88 8.9035L7.917 8.0935H7.853V8.1785L8.075 8.503L9.2475 10.2635L9.3085 10.8035L9.2235 10.98L8.9195 11.0865L8.5855 11.0255L7.8985 10.063L7.191 8.9795L6.6195 8.008L6.5495 8.048L6.2125 11.675L6.0545 11.86L5.69 12L5.3865 11.7695L5.2255 11.396L5.3865 10.658L5.581 9.696L5.7385 8.931L5.8815 7.981L5.9665 7.665L5.9605 7.644L5.8905 7.653L5.1735 8.6365L4.0835 10.109L3.2205 11.0315L3.0135 11.1135L2.655 10.9285L2.6885 10.5975L2.889 10.303L4.083 8.785L4.803 7.844L5.268 7.301L5.265 7.222H5.2375L2.066 9.28L1.501 9.353L1.2575 9.125L1.288 8.752L1.4035 8.6305L2.3575 7.9745L2.3545 7.9775Z" fill="currentColor"/>
				</g>
				<defs>
					<clipPath id="clip0_2002_2">
						<rect width="12" height="12" fill="white"/>
					</clipPath>
				</defs>
			</svg>
			<span>Explore with Claude</span>
		</button>
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
	content.appendChild(aiButtons);
	content.appendChild(disclaimer);

	container.appendChild(content);

	return container;
}

function showLoading(container: HTMLElement) {
	const content = container.querySelector(".sheet-content") as HTMLElement;
	if (!content) return;

	// Find and replace the explanation text with loading skeleton
	const explanationText = content.querySelector(
		".text-sm.text-\\[var\\(--sl-color-gray-2\\)\\].p-4",
	) as HTMLElement;
	if (!explanationText) return;

	explanationText.innerHTML = `
		<div class="space-y-3 animate-pulse">
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-full"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-5/6"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-4/6"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-full mt-6"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-3/4"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-5/6"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-2/3 mt-6"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-full"></div>
			<div class="h-4 bg-[var(--sl-color-gray-5)] rounded w-4/5"></div>
		</div>
	`;
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
