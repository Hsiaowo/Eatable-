# Eatable

Eatable is a small web project for turning grocery receipts into estimated food freshness reminders.

## Project Structure

```text
frontend/  React + Vite UI
backend/   Express API and reminder pipeline
docs/      Product and API notes
```

## MVP Pipeline

1. Upload a receipt image or paste receipt text
2. Extract receipt text
3. Parse grocery items
4. Normalize food names
5. Estimate reminder dates
6. Export calendar reminders as `.ics`

## Quick Start

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## Notes

- The backend currently ships with sample parsing and reminder logic.
- OCR is stubbed for MVP scaffolding and can be replaced later with a real provider.
- Calendar export already returns a valid `.ics` file.
