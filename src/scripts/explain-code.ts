console.log("[Explain Code] Script loaded!");

const sheets = new Map<string, HTMLDivElement>();

function initExplainCodeButtons() {
	const buttons = document.querySelectorAll<HTMLButtonElement>(
		"button[data-sheet-trigger]",
	);

	console.log(`[Explain Code] Found ${buttons.length} explain code buttons`);

	// Use event delegation on document body to catch all clicks
	document.body.addEventListener("click", (e) => {
		const target = e.target as HTMLElement;
		const button = target.closest<HTMLButtonElement>(
			"button[data-sheet-trigger]",
		);

		if (!button) return;

		console.log(`[Explain Code] Button clicked via delegation!`);
		e.preventDefault();
		e.stopPropagation();

		const sheetId = button.dataset.sheetTrigger;
		const codeContent = button.dataset.codeContent;
		const codeLanguage = button.dataset.codeLanguage;

		console.log(`[Explain Code] Button data:`, {
			sheetId,
			hasContent: !!codeContent,
			codeLanguage,
		});

		if (!sheetId || !codeContent) {
			console.warn(`[Explain Code] Button missing required data attributes`);
			return;
		}

		let sheet = sheets.get(sheetId);

		if (!sheet) {
			console.log(`[Explain Code] Creating sheet...`);
			sheet = createSheet(sheetId, codeContent, codeLanguage || "text");
			document.body.appendChild(sheet);
			initSheet(sheet);
			sheets.set(sheetId, sheet);
		}

		console.log(`[Explain Code] Opening sheet...`);
		openSheet(sheet);
	});
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
		"sheet-content fixed z-50 gap-4 bg-[var(--sl-color-bg)] p-6 transition ease-in-out";
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
		"sheet-close absolute right-4 top-4 rounded-sm opacity-70 ring-offset-[var(--sl-color-bg)] transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[var(--sl-color-text-accent)] focus:ring-offset-2 disabled:pointer-events-none";
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
		"text-sm text-[var(--sl-color-gray-2)] p-4 bg-[var(--sl-color-gray-6)] rounded";
	explanationText.innerHTML = `
		<p class="mb-2">This feature would integrate with an AI service to provide code explanations.</p>
		<p class="text-xs opacity-70">Note: This is a placeholder. Connect to your preferred AI service to enable real explanations.</p>
	`;

	content.appendChild(closeButton);
	content.appendChild(title);
	content.appendChild(description);
	content.appendChild(explanationText);

	container.appendChild(content);

	return container;
}

function initSheet(container: HTMLElement) {
	const content = container.querySelector(".sheet-content") as HTMLElement;
	const closeButton = container.querySelector(".sheet-close");

	if (!content) return;

	let isOpen = false;

	function closeSheet() {
		isOpen = false;

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

	closeButton?.addEventListener("click", closeSheet);

	document.addEventListener("keydown", (e) => {
		if (e.key === "Escape" && isOpen) {
			closeSheet();
		}
	});
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

console.log("[Explain Code] Setting up event listener for astro:page-load");

document.addEventListener("astro:page-load", () => {
	console.log("[Explain Code] astro:page-load event fired!");
	initExplainCodeButtons();
});

// Also try DOMContentLoaded as a fallback
document.addEventListener("DOMContentLoaded", () => {
	console.log("[Explain Code] DOMContentLoaded event fired!");
	initExplainCodeButtons();
});

// And try running immediately if DOM is already loaded
if (document.readyState === "loading") {
	console.log("[Explain Code] DOM is still loading, waiting...");
} else {
	console.log("[Explain Code] DOM already loaded, initializing immediately");
	initExplainCodeButtons();
}
