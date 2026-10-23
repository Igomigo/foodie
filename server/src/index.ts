import "dotenv/config";
import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/mongo";
import { disconnectRedis } from "./config/redis";
import { getJwtSecret } from "./utils/jwt";
import { logger } from "./utils/logger";

export async function startServer() {
  getJwtSecret();
  const port = Number(process.env.PORT || 2000);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw new Error("PORT must be between 1 and 65535");
  await connectDatabase();
  const server = createApp().listen(port);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  logger.info(`Server is running on port ${port}`, "Server");

  let stopping = false;
  async function shutdown() {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => server.closeAllConnections(), 10000);
    timeout.unref();
    try {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
      await Promise.all([disconnectDatabase(), disconnectRedis()]);
    } catch (error) {
      logger.error(
        error instanceof Error ? error.message : String(error),
        "Shutdown",
      );
      process.exitCode = 1;
    } finally {
      clearTimeout(timeout);
    }
  }
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
  return server;
}

if (require.main === module) {
  startServer().catch(async (error: unknown) => {
    logger.error(
      error instanceof Error ? error.message : String(error),
      "Startup",
    );
    await Promise.allSettled([disconnectDatabase(), disconnectRedis()]);
    process.exitCode = 1;
  });
}
