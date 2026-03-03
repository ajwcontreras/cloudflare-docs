// @ts-check
import { definePlugin } from "@expressive-code/core";

export default () => {
	return definePlugin({
		name: "Adds 'Explain Code' button to code blocks with 10+ lines",
		hooks: {
			postprocessRenderedBlock: async (context) => {
				const lineCount = context.codeBlock.code.split("\n").length;

				if (lineCount < 10) return;

				const codeContent = context.codeBlock.code;
				const language = context.codeBlock.language;
				const sheetId = `explain-code-${Math.random().toString(36).substring(2, 11)}`;

				// Find the pre element to add the button to
				const findPre = (node) => {
					if (node.tagName === "pre") return node;
					if (node.children) {
						for (const child of node.children) {
							const result = findPre(child);
							if (result) return result;
						}
					}
					return null;
				};

				const preElement = findPre(context.renderData.blockAst);
				if (!preElement) return;

				// Add class to pre element to help position the copy button
				preElement.properties = preElement.properties || {};
				preElement.properties.className = preElement.properties.className || [];
				if (Array.isArray(preElement.properties.className)) {
					preElement.properties.className.push("has-explain-button");
				}

				const explainButton = {
					type: "element",
					tagName: "button",
					properties: {
						className: ["explain-button"],
						type: "button",
						"data-sheet-trigger": sheetId,
						"data-code-content": codeContent,
						"data-code-language": language,
						"aria-label": "Explain Code",
					},
					children: [
						{
							type: "element",
							tagName: "svg",
							properties: {
								xmlns: "http://www.w3.org/2000/svg",
								width: "24",
								height: "24",
								viewBox: "0 0 24 24",
								fill: "none",
								stroke: "currentColor",
								"stroke-width": "2",
								"stroke-linecap": "round",
								"stroke-linejoin": "round",
							},
							children: [
								{
									type: "element",
									tagName: "path",
									properties: {
										d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z",
									},
									children: [],
								},
								{
									type: "element",
									tagName: "path",
									properties: {
										d: "M20 3v4",
									},
									children: [],
								},
								{
									type: "element",
									tagName: "path",
									properties: {
										d: "M22 5h-4",
									},
									children: [],
								},
								{
									type: "element",
									tagName: "path",
									properties: {
										d: "M4 17v2",
									},
									children: [],
								},
								{
									type: "element",
									tagName: "path",
									properties: {
										d: "M5 18H3",
									},
									children: [],
								},
							],
						},
						{
							type: "element",
							tagName: "span",
							properties: {
								className: ["explain-tooltip"],
							},
							children: [{ type: "text", value: "Explain Code" }],
						},
					],
				};

				preElement.children.unshift(explainButton);
			},
		},
	});
};
