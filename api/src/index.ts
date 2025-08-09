import "dotenv/config"; // charge les variables depuis .env
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { requireOrg } from "./middlewares/org";
import { customersRouter } from "./routes/customers";


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (_req, res) => res.send("API OK 🚀"));
app.use("/health", healthRouter);
app.use(requireOrg);
app.use("/customers", customersRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 API running on http://localhost:${port}`);
});


