# API Design

## `POST /api/receipt/test`

Input:

```json
{
  "receiptText": "BANANA 1.99\nSPINACH 2.49",
  "purchaseDate": "2026-04-19"
}
```

Output:

```json
{
  "purchaseDate": "2026-04-19",
  "items": [
    {
      "rawText": "BANANA",
      "normalizedName": "banana",
      "category": "fruit",
      "estimatedShelfLifeDays": 3,
      "reminderDate": "2026-04-22",
      "included": true
    }
  ]
}
```

## `POST /api/receipt/upload`

Multipart form upload for a receipt image.

## `POST /api/reminders/export`

Accepts selected reminder items and returns an `.ics` calendar file.
