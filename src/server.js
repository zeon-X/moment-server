import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { createServer } from "http";
import { initializeSocket } from "./socket/index.js";

const PORT = env.PORT || 5000;
const server = createServer(app);

initializeSocket(server);

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to database");
    console.error(error);
    process.exit(1);
  }
}

startServer();
