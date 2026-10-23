const { spawn } = require("node:child_process");
const { once } = require("node:events");
const { mkdtemp, rm } = require("node:fs/promises");
const { tmpdir } = require("node:os");
const { join } = require("node:path");
const net = require("node:net");
const { MongoClient } = require("mongoose").mongo;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startTestDatabase() {
  const database = `foodie_test_${Date.now()}_${process.pid}`;
  if (process.env.TEST_MONGODB_URI) {
    const uri = new URL(process.env.TEST_MONGODB_URI);
    uri.pathname = `/${database}`;
    return { uri: uri.toString(), stop: async () => {} };
  }

  const directory = await mkdtemp(join(tmpdir(), "foodie-test-"));
  const socket = net.createServer();
  socket.listen(0, "127.0.0.1");
  await once(socket, "listening");
  const port = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  const mongoProcess = spawn(
    "mongod",
    [
      "--dbpath",
      directory,
      "--port",
      String(port),
      "--bind_ip",
      "127.0.0.1",
      "--replSet",
      "foodie_test_rs",
      "--nounixsocket",
      "--logpath",
      join(directory, "mongo.log"),
    ],
    { stdio: "ignore" },
  );
  let startupError;
  mongoProcess.on("error", (error) => {
    startupError = error;
  });
  const uri = `mongodb://127.0.0.1:${port}/${database}?directConnection=true`;
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 400 });

  async function stop() {
    await client.close();
    if (
      mongoProcess.exitCode === null &&
      mongoProcess.signalCode === null &&
      mongoProcess.pid
    ) {
      const exited = once(mongoProcess, "exit");
      mongoProcess.kill("SIGTERM");
      await exited;
    }
    await rm(directory, { recursive: true, force: true });
  }

  try {
    let connected = false;
    for (let attempt = 0; attempt < 40; attempt++) {
      if (startupError)
        throw new Error(
          "Install mongod or set TEST_MONGODB_URI to a test replica set",
        );
      if (mongoProcess.exitCode !== null)
        throw new Error(
          `Test mongod exited with code ${mongoProcess.exitCode}`,
        );
      try {
        await client.connect();
        connected = true;
        break;
      } catch {
        await delay(200);
      }
    }
    if (!connected) throw new Error("Test MongoDB did not start");
    await client.db("admin").command({
      replSetInitiate: {
        _id: "foodie_test_rs",
        members: [{ _id: 0, host: `127.0.0.1:${port}` }],
      },
    });
    let ready = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      const hello = await client.db("admin").command({ hello: 1 });
      if (hello.isWritablePrimary) {
        ready = true;
        break;
      }
      await delay(200);
    }
    if (!ready) throw new Error("Test replica set did not elect a primary");
    await client.close();
    return { uri, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}

module.exports = { startTestDatabase };
