import express from "express";
import cors from "cors";
import receiptRoutes from "./routes/receiptRoutes.js";
import reminderRoutes from "./routes/reminderRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", service: "eatable-backend" });
});

app.use("/api/receipt", receiptRoutes);
app.use("/api/reminders", reminderRoutes);

app.listen(port, () => {
  console.log(`Eatable backend listening on port ${port}`);
});
