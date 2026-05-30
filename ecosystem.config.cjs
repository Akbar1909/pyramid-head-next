const path = require("node:path");
const dotenv = require("dotenv");

const envPath = path.join(__dirname, ".env");
const { parsed } = dotenv.config({ path: envPath });
const fromFile = parsed && typeof parsed === "object" ? { ...parsed } : {};

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
