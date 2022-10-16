/**
 * PM2 (Process Manager 2) Config file
 */
module.exports = {
  apps: [
    {
      name: "limelight-api",
      script: "./server.ts",
    },
  ],
};
