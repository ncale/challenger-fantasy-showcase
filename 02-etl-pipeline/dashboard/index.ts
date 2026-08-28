import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { createQueue } from "../queue";
import express from "express";

const queue = createQueue();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/");

createBullBoard({ queues: [new BullMQAdapter(queue)], serverAdapter });

const app = express();
app.use("/", serverAdapter.getRouter());

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => console.log(`[ingest-dashboard] http://localhost:${PORT}`));
