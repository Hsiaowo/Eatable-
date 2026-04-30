import OpenAI from "openai";
import { estimateReminders } from "./expiryService.js";
import { addDays } from "../utils/dateUtils.js";

let openaiClient = null;

export async function buildPerishableReminders({ parsedItems, normalizedItems, purchaseDate }) {
  if (!process.env.OPENAI_API_KEY) {
    const fallbackItems = estimateReminders(normalizedItems, purchaseDate);
    return {
      items: fallbackItems,
      htmlSummary: buildFallbackHtmlSummary(fallbackItems, purchaseDate, "local-fallback"),
      classificationProvider: "local-fallback",
      classificationWarning: "OPENAI_API_KEY is not configured. Falling back to local shelf-life rules."
    };
  }

  try {
    const result = await classifyWithOpenAI({ parsedItems, normalizedItems, purchaseDate });
    return {
      items: result.items.map((item) => ({
        rawText: item.rawText,
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
      items: fallbackItems,
      htmlSummary: buildFallbackHtmlSummary(fallbackItems, purchaseDate, "local-fallback"),
      classificationProvider: "local-fallback",
      classificationWarning:
        "OpenAI classification failed. Falling back to local shelf-life rules for this request."
    };
  }
}

async function classifyWithOpenAI({ parsedItems, normalizedItems, purchaseDate }) {
  const client = getOpenAIClient();
  const response = await client.responses.create({
    model: process.env.OPENAI_CLASSIFIER_MODEL || "gpt-5-nano",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text:
              "You classify grocery receipt items. Keep only edible perishable groceries that reasonably need a freshness reminder after purchase. Drop non-food items, shelf-stable pantry items, canned goods, dry goods, paper goods, household supplies, fees, taxes, discounts, deposits, and ambiguous store metadata. Use the parsed item text and heuristic normalization hints. Return only clearly perishable items with approximate storage days for normal home storage. Use singular normalized names when possible. Also return an htmlSummary string that is a safe HTML fragment only, with no markdown and no script/style tags. The HTML should use only simple tags like section, h2, p, ul, li, and strong. The HTML should summarize the perishable items, their category, likely storage location, and approximate preservation time."
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
                parsedItems,
                heuristicItems: normalizedItems
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
                  rawText: {
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
                  "rawText",
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
  });

  const outputText = response.output_text || "";
  if (!outputText.trim()) {
    throw new Error("OpenAI returned an empty classification response.");
  }

  const parsedOutput = JSON.parse(outputText);
  return {
    items: parsedOutput.items
      .filter((item) => item.estimatedStorageDays > 0)
      .map((item) => ({
        ...item,
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
            `<li><strong>${escapeHtml(item.normalizedName)}</strong> (${escapeHtml(item.category)}) - about ${item.estimatedShelfLifeDays} day(s), remind on ${escapeHtml(item.reminderDate)}.</li>`
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
