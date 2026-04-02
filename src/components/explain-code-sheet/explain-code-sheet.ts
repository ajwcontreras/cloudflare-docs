import "../sheet/sheet";
import type { SheetElement } from "../sheet/sheet";

const EXPLAIN_CODE_STYLES = `
.sheet-title {
	font-size: 1.125rem;
	font-weight: 600;
	margin-bottom: 1rem;
}

.explanation-content {
	font-size: 0.875rem;
	color: var(--sl-color-gray-2);
	padding: 1rem;
	background: var(--sl-color-gray-6);
	border-radius: 0.25rem;
	overflow: auto;
}

.loading-skeleton {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
}

.skeleton-line {
	height: 1rem;
	background: var(--sl-color-gray-5);
	border-radius: 0.25rem;
	animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-line.w-5-6 { width: 83.333%; }
.skeleton-line.w-4-6 { width: 66.667%; }
.skeleton-line.w-3-4 { width: 75%; }
.skeleton-line.w-2-3 { width: 66.667%; }
.skeleton-line.w-4-5 { width: 80%; }
.skeleton-line.mt-6 { margin-top: 1.5rem; }

@keyframes pulse {
	0%, 100% { opacity: 1; }
	50% { opacity: 0.5; }
}

.error-state {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1rem;
	border-radius: 0.25rem;
	background: var(--sl-color-red-low);
	border: 1px solid var(--sl-color-red);
	font-size: 0.875rem;
	color: var(--sl-color-text);
}

.error-state svg {
	flex-shrink: 0;
	margin-top: 0.125rem;
	color: var(--sl-color-red);
}

.sheet-actions {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	margin-top: 1rem;
}

.explore-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	border-radius: 0.25rem;
	background: var(--sl-color-gray-6);
	border: 1px solid var(--sl-color-gray-5);
	font-size: 0.875rem;
	font-weight: 500;
	cursor: pointer;
	transition: background-color 0.2s;
}

.explore-btn:hover {
	background: var(--sl-color-gray-5);
}

.sheet-disclaimer {
	display: flex;
	align-items: flex-start;
	gap: 0.75rem;
	padding: 1rem;
	margin-top: 1rem;
	border-radius: 0.25rem;
	background: var(--sl-color-orange-low);
	border: 1px solid var(--sl-color-orange);
	font-size: 0.875rem;
	color: var(--sl-color-text);
}

.sheet-disclaimer svg {
	flex-shrink: 0;
	margin-top: 0.125rem;
	color: var(--sl-color-orange);
}
`;

const ERROR_MESSAGE = "Unable to generate explanation. Please try again later.";

const LOADING_HTML = `
	<h2 class="sheet-title">Code Explanation</h2>
	<div class="explanation-content">
		<div class="loading-skeleton">
			<div class="skeleton-line"></div>
			<div class="skeleton-line w-5-6"></div>
			<div class="skeleton-line w-4-6"></div>
			<div class="skeleton-line mt-6"></div>
			<div class="skeleton-line w-3-4"></div>
			<div class="skeleton-line w-5-6"></div>
			<div class="skeleton-line w-2-3 mt-6"></div>
			<div class="skeleton-line"></div>
			<div class="skeleton-line w-4-5"></div>
		</div>
	</div>
`;

const ERROR_HTML = `
	<h2 class="sheet-title">Code Explanation</h2>
	<div class="error-state">
		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="12" cy="12" r="10"/>
			<line x1="12" y1="8" x2="12" y2="12"/>
			<line x1="12" y1="16" x2="12.01" y2="16"/>
		</svg>
		<div>
			<p>${ERROR_MESSAGE}</p>
		</div>
	</div>
`;

function getSuccessHtml(explanation: string): string {
	return `
		<h2 class="sheet-title">Code Explanation</h2>
		<div class="explanation-content">
			${explanation}
		</div>
		<div class="sheet-actions">
			<button type="button" class="explore-btn" data-provider="chatgpt">
				<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round">
					<path d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60018C6.24341 4.58418 6.25101 4.56868 6.26368 4.55868L9.52802 2.70014C10.9818 1.87313 12.8399 2.36564 13.6796 3.80067C14.0348 4.40718 14.1625 5.1177 14.0414 5.8062V5.8057ZM5.50334 8.57825L4.13872 7.80024C4.12454 7.79174 4.11541 7.77774 4.11339 7.76174V4.04366C4.11441 2.38763 5.47535 1.04611 7.15298 1.04661C7.86291 1.04561 8.55104 1.29012 9.09679 1.73813C9.07196 1.75113 9.0294 1.77413 8.99949 1.79163L5.77062 3.63167C5.60543 3.72417 5.50409 3.89768 5.50536 4.08518L5.50334 8.57825ZM6.24391 7.11623L7.99949 6.10171L9.75556 7.11523V9.14327L7.99949 10.1568L6.24391 9.14327V7.11623Z" fill="currentColor"/>
				</svg>
				<span>Explore with ChatGPT</span>
			</button>
			<button type="button" class="explore-btn" data-provider="claude">
				<svg width="16" height="16" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
					<g clip-path="url(#clip0_explain)">
						<path fill-rule="evenodd" clip-rule="evenodd" d="M2.3545 7.9775L4.7145 6.654L4.7545 6.539L4.7145 6.475H4.6L4.205 6.451L2.856 6.4145L1.6865 6.366L0.5535 6.305L0.268 6.2445L0 5.892L0.0275 5.716L0.2675 5.5555L0.6105 5.5855L1.3705 5.637L2.5095 5.716L3.3355 5.7645L4.56 5.892H4.7545L4.782 5.8135L4.715 5.7645L4.6635 5.716L3.4845 4.918L2.2085 4.074L1.5405 3.588L1.1785 3.3425L0.9965 3.1115L0.9175 2.6075L1.2455 2.2465L1.686 2.2765L1.7985 2.307L2.245 2.65L3.199 3.388L4.4445 4.3045L4.627 4.4565L4.6995 4.405L4.709 4.3685L4.627 4.2315L3.9495 3.0085L3.2265 1.7635L2.9045 1.2475L2.8195 0.938C2.78711 0.819128 2.76965 0.696687 2.7675 0.5735L3.1415 0.067L3.348 0L3.846 0.067L4.056 0.249L4.366 0.956L4.867 2.0705L5.6445 3.5855L5.8725 4.0345L5.994 4.4505L6.0395 4.578H6.1185V4.505L6.1825 3.652L6.301 2.6045L6.416 1.257L6.456 0.877L6.644 0.422L7.0175 0.176L7.3095 0.316L7.5495 0.6585L7.516 0.8805L7.373 1.806L7.0935 3.2575L6.9115 4.2285H7.0175L7.139 4.1075L7.6315 3.4545L8.4575 2.4225L8.8225 2.0125L9.2475 1.5605L9.521 1.345H10.0375L10.4175 1.9095L10.2475 2.4925L9.7155 3.166L9.275 3.737L8.643 4.587L8.248 5.267L8.2845 5.322L8.3785 5.312L9.8065 5.009L10.578 4.869L11.4985 4.7115L11.915 4.9055L11.9605 5.103L11.7965 5.5065L10.812 5.7495L9.6575 5.9805L7.938 6.387L7.917 6.402L7.9415 6.4325L8.716 6.5055L9.047 6.5235H9.858L11.368 6.636L11.763 6.897L12 7.216L11.9605 7.4585L11.353 7.7685L10.533 7.574L8.6185 7.119L7.9625 6.9545H7.8715V7.0095L8.418 7.5435L9.421 8.4485L10.6755 9.6135L10.739 9.9025L10.578 10.13L10.408 10.1055L9.3055 9.277L8.88 8.9035L7.917 8.0935H7.853V8.1785L8.075 8.503L9.2475 10.2635L9.3085 10.8035L9.2235 10.98L8.9195 11.0865L8.5855 11.0255L7.8985 10.063L7.191 8.9795L6.6195 8.008L6.5495 8.048L6.2125 11.675L6.0545 11.86L5.69 12L5.3865 11.7695L5.2255 11.396L5.3865 10.658L5.581 9.696L5.7385 8.931L5.8815 7.981L5.9665 7.665L5.9605 7.644L5.8905 7.653L5.1735 8.6365L4.0835 10.109L3.2205 11.0315L3.0135 11.1135L2.655 10.9285L2.6885 10.5975L2.889 10.303L4.083 8.785L4.803 7.844L5.268 7.301L5.265 7.281L5.181 7.283L4.4115 7.409L2.3545 7.9775Z" fill="currentColor"/>
					</g>
					<defs>
						<clipPath id="clip0_explain">
							<rect width="12" height="12" fill="white"/>
						</clipPath>
					</defs>
				</svg>
				<span>Explore with Claude</span>
			</button>
		</div>
		<div class="sheet-disclaimer">
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
				<line x1="12" y1="9" x2="12" y2="13"/>
				<line x1="12" y1="17" x2="12.01" y2="17"/>
			</svg>
			<div>
				<p>Explain Code is experimental and may produce incorrect answers. Always verify the output before executing.</p>
			</div>
		</div>
	`;
}

class ExplainCodeElement extends HTMLElement {
	private codeBlockPosition = 0;
	private abortController: AbortController | null = null;
	private sheet: SheetElement | null = null;

	connectedCallback() {
		this.injectStyles();
		this.codeBlockPosition = parseInt(
			this.getAttribute("code-block-position") || "0",
			10,
		);

		this.innerHTML = `<cfdocs-sheet></cfdocs-sheet>`;
		this.sheet = this.querySelector("cfdocs-sheet") as SheetElement;

		this.sheet?.addEventListener("sheet-close", () => {
			this.remove();
		});

		this.sheet?.setContent(LOADING_HTML);
		this.sheet?.open();

		this.fetchExplanation();
	}

	disconnectedCallback() {
		this.abortController?.abort();
	}

	private injectStyles() {
		if (document.getElementById("cfdocs-explain-code-styles")) return;
		const style = document.createElement("style");
		style.id = "cfdocs-explain-code-styles";
		style.textContent = EXPLAIN_CODE_STYLES;
		document.head.appendChild(style);
	}

	private getApiBaseUrl(): string {
		return (
			(import.meta.env?.PUBLIC_EXPLAIN_CODE_API_URL as string | undefined) ||
			"https://docs-ai-production.cloudflare-docs.workers.dev"
		);
	}

	private async fetchExplanation() {
		this.abortController = new AbortController();
		const path = window.location.pathname.replace(/^\/|\/$/g, "");
		const baseUrl = this.getApiBaseUrl();
		const url = `${baseUrl}/explain/${path}?codeBlock=${this.codeBlockPosition}`;

		try {
			const response = await fetch(url, {
				signal: this.abortController.signal,
				headers: {
					Accept: "text/html",
				},
			});

			const finishReason = response.headers.get("cf-docs-finish-reason");

			if (!response.ok || finishReason !== "stop") {
				throw new Error("Request failed");
			}

			const explanation = await response.text();
			this.sheet?.setContent(getSuccessHtml(explanation));
		} catch (error) {
			if ((error as Error).name === "AbortError") return;
			this.sheet?.setContent(ERROR_HTML);
		}
	}
}

customElements.define("cfdocs-explain-code", ExplainCodeElement);

export { ExplainCodeElement };
