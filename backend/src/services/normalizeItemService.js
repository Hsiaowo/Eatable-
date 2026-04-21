const itemMappings = {
  "ORG SPNCH": "spinach",
  SPINACH: "spinach",
  "STRAWBERRY 1LB": "strawberry",
  STRWBRY: "strawberry",
  BANANA: "banana",
  "MILK 2%": "milk",
  "AVCD HASS": "avocado"
};

export function normalizeItems(items) {
  return items.map((rawText) => ({
    rawText,
    normalizedName: itemMappings[rawText] || rawText.toLowerCase(),
    category: getCategory(itemMappings[rawText] || rawText.toLowerCase())
  }));
}

function getCategory(itemName) {
  if (["banana", "strawberry", "avocado"].includes(itemName)) {
    return "fruit";
  }

  if (["spinach"].includes(itemName)) {
    return "vegetable";
  }

  if (["milk"].includes(itemName)) {
    return "dairy";
  }

  return "other";
}
