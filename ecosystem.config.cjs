module.exports = {
  apps: [
    {
      name: "fyndo-api",
      script: "dist/index.js",

      exec_mode: "fork",
      instances: 1,

      autorestart: true,
      watch: false,

      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
