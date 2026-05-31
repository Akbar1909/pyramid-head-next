const path = require("node:path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, ".env");
const prodEnvPath = path.join(__dirname, ".env.prod");
const fromProd = dotenv.config({ path: prodEnvPath }).parsed;
const fromDefault = dotenv.config({ path: envPath }).parsed;
const fromFile =
  fromDefault && typeof fromDefault === "object"
    ? { ...fromDefault }
    : fromProd && typeof fromProd === "object"
      ? { ...fromProd }
      : {};

module.exports = {
  apps: [
    {
      name: "pyramid-head-next",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      time: true,
      merge_logs: true,
      env: {
        ...fromFile,
        NODE_ENV: "production",
        PORT: fromFile.PORT || process.env.PORT || "3400",
      },
    },
  ],
};
