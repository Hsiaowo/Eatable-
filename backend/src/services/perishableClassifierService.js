import OpenAI from "openai";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { estimateReminders } from "./expiryService.js";
import { addDays } from "../utils/dateUtils.js";

let openaiClient = null;
let interpretationRulesPromise = null;
const OPENAI_TIMEOUT_MS = 12000;

export async function buildPerishableReminders({ parsedItems, normalizedItems, purchaseDate }) {
  if (!process.env.OPENAI_API_KEY) {
    const fallbackItems = estimateReminders(normalizedItems, purchaseDate);
    return {
      items: fallbackItems.map((item) => ({
        ...item,
        interpretedName: item.normalizedName
      })),
      htmlSummary: buildFallbackHtmlSummary(fallbackItems, purchaseDate, "local-fallback"),
      classificationProvider: "local-fallback",
      classificationWarning: "OPENAI_API_KEY is not configured. Falling back to local shelf-life rules."
    };
  }

  try {
    const result = await classifyWithOpenAI({ parsedItems, normalizedItems, purchaseDate });
    return {
      items: result.items.map((item) => ({
        lineId: item.lineId,
        rawText: item.rawText,
        interpretedName: item.interpretedName,
        normalizedName: item.normalizedName,
        category: item.category,
        estimatedShelfLifeDays: item.estimatedStorageDays,
        reminderDate: addDays(purchaseDate, item.estimatedStorageDays),
        storageLocation: item.storageLocation,
        reasoning: item.reasoning,
        included: true
      })),
      htmlSummary: sanitizeHtmlFragment(result.htmlSummary),
      classificationProvider: "openai",
      classificationWarning: ""
    };
  } catch (error) {
    console.error("OpenAI perishable classification failed:", error);
    const fallbackItems = estimateReminders(normalizedItems, purchaseDate);
    return {
      items: fallbackItems.map((item) => ({
        ...item,
        interpretedName: item.normalizedName
      })),
      htmlSummary: buildFallbackHtmlSummary(fallbackItems, purchaseDate, "local-fallback"),
      classificationProvider: "local-fallback",
      classificationWarning:
        "OpenAI classification failed. Falling back to local shelf-life rules for this request."
    };
  }
}

async function classifyWithOpenAI({ parsedItems, normalizedItems, purchaseDate }) {
  const client = getOpenAIClient();
  const interpretationRules = await getInterpretationRules();
  const indexedParsedItems = parsedItems.map((rawText, index) => ({
    lineId: index + 1,
    rawText
  }));
  const parsedLineLookup = new Map(indexedParsedItems.map((item) => [item.lineId, item.rawText]));
  const compactHeuristics = normalizedItems.map((item) => ({
    rawText: item.rawText,
    normalizedName: item.normalizedName,
    categoryHint: item.category
  }));

  const response = await withTimeout(
    client.responses.create({
      model: process.env.OPENAI_CLASSIFIER_MODEL || "gpt-5-nano",
      reasoning: {
        effort: "minimal"
      },
      max_output_tokens: 900,
      input: [
        {
          role: "developer",
          content: [
            {
              type: "input_text",
              text: interpretationRules
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(
                {
                  purchaseDate,
                  parsedItems: indexedParsedItems,
                  heuristicItems: compactHeuristics
                },
                null,
                2
              )
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "perishable_receipt_items",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    lineId: {
                      type: "integer"
                    },
                    rawText: {
                      type: "string"
                    },
                    interpretedName: {
                      type: "string"
                    },
                    normalizedName: {
                      type: "string"
                    },
                    category: {
                      type: "string"
                    },
                    estimatedStorageDays: {
                      type: "integer"
                    },
                    storageLocation: {
                      type: "string",
                      enum: ["fridge", "room_temperature", "pantry", "freezer", "mixed"]
                    },
                    reasoning: {
                      type: "string"
                    }
                  },
                  required: [
                    "lineId",
                    "rawText",
                    "interpretedName",
                    "normalizedName",
                    "category",
                    "estimatedStorageDays",
                    "storageLocation",
                    "reasoning"
                  ]
                }
              },
              htmlSummary: {
                type: "string"
              }
            },
            required: ["items", "htmlSummary"]
          }
        }
      }
    }),
    OPENAI_TIMEOUT_MS,
    "OpenAI classification timed out."
  );

  const outputText = response.output_text || "";
  if (!outputText.trim()) {
    throw new Error("OpenAI returned an empty classification response.");
  }

  const parsedOutput = JSON.parse(outputText);
  return {
    items: parsedOutput.items
      .filter((item) => item.estimatedStorageDays > 0)
      .filter((item) => parsedLineLookup.has(item.lineId))
      .map((item) => ({
        ...item,
        rawText: parsedLineLookup.get(item.lineId),
        interpretedName: item.interpretedName.trim(),
        normalizedName: item.normalizedName.trim().toLowerCase(),
        category: item.category.trim().toLowerCase(),
        reasoning: item.reasoning.trim()
      })),
    htmlSummary: parsedOutput.htmlSummary
  };
}

function getOpenAIClient() {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  return openaiClient;
}

async function getInterpretationRules() {
  if (!interpretationRulesPromise) {
    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const rulesPath = path.resolve(currentDir, "../../..", "docs", "receipt-interpretation-rules.md");
    interpretationRulesPromise = readFile(rulesPath, "utf8");
  }

  return interpretationRulesPromise;
}

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    })
  ]);
}

function sanitizeHtmlFragment(html) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/giu, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/giu, "")
    .replace(/\son\w+="[^"]*"/giu, "")
    .replace(/\son\w+='[^']*'/giu, "")
    .replace(/javascript:/giu, "");
}

function buildFallbackHtmlSummary(items, purchaseDate, provider) {
  const listItems = items.length
    ? items
        .map(
          (item) =>
            `<li><strong>${escapeHtml(item.interpretedName || item.normalizedName)}</strong> (${escapeHtml(item.category)}) - about ${item.estimatedShelfLifeDays} day(s), remind on ${escapeHtml(item.reminderDate)}.</li>`
        )
        .join("")
    : "<li>No perishable items were identified.</li>";

  return [
    `<section data-provider="${escapeHtml(provider)}">`,
    "<h2>Perishable Item Summary</h2>",
    `<p>Purchase date: <strong>${escapeHtml(purchaseDate)}</strong></p>`,
    "<ul>",
    listItems,
    "</ul>",
    "</section>"
  ].join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
