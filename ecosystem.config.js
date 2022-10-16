/**
 * PM2 (Process Manager 2) Config file
 */
module.exports = {
  apps: [
    {
      name: "sosmed-api",
      script: "./server.ts",
    },
  ],
};
