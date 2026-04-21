import shelfLife from "../data/shelfLife.json" with { type: "json" };
import { addDays } from "../utils/dateUtils.js";

export function estimateReminders(items, purchaseDate) {
  return items
    .map((item) => {
      const shelfLifeEntry = shelfLife[item.normalizedName];

      if (!shelfLifeEntry) {
        return null;
      }

      return {
        rawText: item.rawText,
        normalizedName: item.normalizedName,
        category: shelfLifeEntry.category,
        estimatedShelfLifeDays: shelfLifeEntry.fridgeDays,
        reminderDate: addDays(purchaseDate, shelfLifeEntry.fridgeDays),
        included: true
      };
    })
    .filter(Boolean);
}
