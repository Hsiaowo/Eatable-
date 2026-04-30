const catalog = {
  spinach: {
    category: "vegetable",
    aliases: ["spinach", "spnach", "spnch", "org spnch", "baby spinach"]
  },
  strawberry: {
    category: "fruit",
    aliases: ["strawberry", "strawberries", "strwbry", "strwbr", "berry"]
  },
  banana: {
    category: "fruit",
    aliases: ["banana", "bananas", "bnna", "ban"]
  },
  milk: {
    category: "dairy",
    aliases: ["milk", "milk 2", "2 milk", "whole milk", "skim milk", "homo milk", "2% milk"]
  },
  avocado: {
    category: "fruit",
    aliases: ["avocado", "avocados", "avcd", "avcd hass", "hass avocado"]
  },
  yogurt: {
    category: "dairy",
    aliases: ["yogurt", "yoghurt", "greek yogurt", "yogourt"]
  },
  lettuce: {
    category: "vegetable",
    aliases: ["lettuce", "romaine", "iceberg", "romaine hearts", "spring mix", "salad"]
  },
  blueberry: {
    category: "fruit",
    aliases: ["blueberry", "blueberries", "blubry", "blue berry"]
  },
  raspberry: {
    category: "fruit",
    aliases: ["raspberry", "raspberries", "rasp"]
  },
  chicken: {
    category: "protein",
    aliases: ["chicken", "chkn", "chicken breast", "chicken thigh", "chkn brst", "breast"]
  },
  salmon: {
    category: "protein",
    aliases: ["salmon", "atl salmon", "sockeye salmon", "salmn"]
  },
  tomato: {
    category: "vegetable",
    aliases: ["tomato", "tomatoes", "roma tomato", "grape tomato"]
  },
  cucumber: {
    category: "vegetable",
    aliases: ["cucumber", "cucumbers", "english cucumber", "cukes"]
  },
  cheese: {
    category: "dairy",
    aliases: ["cheese", "cheddar", "mozzarella", "parm", "parmesan"]
  },
  egg: {
    category: "protein",
    aliases: ["egg", "eggs", "large eggs"]
  },
  grape: {
    category: "fruit",
    aliases: ["grape", "grapes", "seedless grapes"]
  },
  apple: {
    category: "fruit",
    aliases: ["apple", "apples", "gala apple", "fuji apple"]
  }
};

const fillerTokens = new Set([
  "org",
  "organic",
  "fresh",
  "farm",
  "market",
  "large",
  "small",
  "medium",
  "pc",
  "ea",
  "pkg",
  "pack",
  "lb",
  "lbs",
  "kg",
  "g",
  "ml",
  "l"
]);

export function normalizeItems(items) {
  return items.map((rawText) => {
    const cleaned = cleanForMatching(rawText);
    const normalizedName = findBestMatch(cleaned);

    return {
      rawText,
      normalizedName: normalizedName || cleaned.toLowerCase(),
      category: normalizedName ? catalog[normalizedName].category : "other"
    };
  });
}

function findBestMatch(cleanedText) {
  const textTokens = tokenize(cleanedText);
  let bestMatch = null;
  let bestScore = 0;

  for (const [canonicalName, entry] of Object.entries(catalog)) {
    const aliases = [canonicalName, ...entry.aliases];

    for (const alias of aliases) {
      const aliasTokens = tokenize(alias);
      const score = computeScore(textTokens, aliasTokens, cleanedText, alias);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = canonicalName;
      }
    }
  }

  return bestScore >= 2 ? bestMatch : null;
}

function computeScore(textTokens, aliasTokens, cleanedText, alias) {
  if (!aliasTokens.length) {
    return 0;
  }

  let score = 0;
  const aliasText = alias.toLowerCase();

  if (cleanedText.includes(aliasText)) {
    score += 3;
  }

  for (const token of aliasTokens) {
    if (textTokens.includes(token)) {
      score += 2;
    } else if (textTokens.some((textToken) => textToken.startsWith(token) || token.startsWith(textToken))) {
      score += 1;
    }
  }

  return score;
}

function cleanForMatching(value) {
  return value
    .toLowerCase()
    .replace(/[%/.-]/gu, " ")
    .replace(/\b\d+\b/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function tokenize(value) {
  return value
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => !fillerTokens.has(token));
}
