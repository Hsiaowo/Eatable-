# Receipt Interpretation Rules

Use this guide when interpreting parsed grocery receipt lines from supermarkets.

## Goal

Interpret short, noisy, abbreviated supermarket item lines into likely human-readable grocery items.

After interpretation:

1. Keep only edible perishable groceries.
2. Drop non-perishable, non-food, and store-metadata lines. 
3. Assign a likely category.
4. Estimate approximate storage time for normal home storage.
5. Return a safe HTML summary fragment.

## Priority Order

When deciding what a parsed receipt line means, use this order:

1. The raw parsed receipt line itself
2. Common supermarket abbreviations and truncations
3. The heuristic normalization hints provided by the app
4. Common grocery knowledge

Do not over-trust weak heuristic hints if the raw line clearly points to another item.

## Abbreviation Rules

Treat short supermarket abbreviations as likely grocery shorthand.

Examples:

- `YGT` -> `yogurt`
- `YOGT` -> `yogurt`
- `AVCD` -> `avocado`
- `HASS` -> `hass avocado`
- `SPNCH` -> `spinach`
- `ORG SPNCH` -> `organic spinach`
- `CHKN` -> `chicken`
- `BRST` -> `breast`
- `CHKN BRST` -> `chicken breast`
- `RMN` or `ROMAINE HRTS` -> `romaine hearts`
- `MLK` -> `milk`
- `HOMO MLK` -> `whole milk`
- `STRWBRY` or `STRWBRY 1LB` -> `strawberry`
- `BLUBRY` -> `blueberry`
- `RASP` -> `raspberry`
- `CUC` -> `cucumber`
- `TMTO` -> `tomato`
- `CHEDR` -> `cheddar cheese`

Interpret abbreviations conservatively. If the line is too ambiguous, do not invent a precise item.

## What Counts As Perishable

Keep items that are usually stored for short periods and should reasonably get a freshness reminder.

Examples:

- fresh fruit
- fresh vegetables
- dairy
- eggs
- fresh meat
- poultry
- seafood
- cut salad mixes
- fresh herbs

## What To Drop

Drop these:

- soap
- paper towels
- tissues
- detergent
- garbage bags
- foil
- batteries
- discounts
- deposits
- tax
- subtotal
- total
- payment lines
- loyalty lines
- shelf-stable pantry items unless clearly short-lived after opening
- canned goods
- dry pasta
- rice
- flour
- sugar
- chips
- crackers

If a line is clearly non-food or not perishable, exclude it entirely from the output items.

## Normalization Rules

For kept perishable items:

1. Keep the original `rawText` exactly as provided.
2. Add `interpretedName` as the likely human-readable item name.
3. Add `normalizedName` as a short singular canonical name.

Examples:

- `YGT STRW` -> interpreted `strawberry yogurt`, normalized `yogurt`
- `CHKN BRST` -> interpreted `chicken breast`, normalized `chicken`
- `ROMAINE HRTS` -> interpreted `romaine hearts`, normalized `lettuce`
- `AVCD HASS` -> interpreted `hass avocado`, normalized `avocado`

## Category Rules

Use broad grocery categories such as:

- `fruit`
- `vegetable`
- `dairy`
- `protein`
- `bakery`
- `prepared_food`

If the item is perishable but unusual, choose the closest reasonable category.

## Storage Rules

Choose one:

- `fridge`
- `room_temperature`
- `pantry`
- `freezer`
- `mixed`

Approximate storage days should reflect typical home storage, not ideal lab conditions.

Examples:

- berries: `3-5`
- spinach: `3-5`
- milk: `5-7`
- yogurt: `7-14`
- chicken: `1-2`
- salmon: `1-2`
- romaine: `4-7`
- avocado: `2-5` depending on ripeness

Return a single approximate integer number of days.

## Reasoning Rules

Keep reasoning short and concrete.

Good:

- `YGT likely means yogurt; yogurt is refrigerated and usually lasts around 7 to 14 days.`

Bad:

- long essays
- vague generic wording

## HTML Summary Rules

Return one safe HTML fragment only.

Allowed tags:

- `section`
- `h2`
- `p`
- `ul`
- `li`
- `strong`

Do not return:

- markdown
- scripts
- styles
- links
- inline event handlers

The HTML should summarize only the kept perishable items and their approximate storage windows.
