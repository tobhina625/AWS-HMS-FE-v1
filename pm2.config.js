// eslint-disable-next-line no-undef
module.exports = {
    apps: [
      {
        name: "vite-app",
        script: "./server.js",
        instances: "max",
        exec_mode: "cluster",
        env: {
          NODE_ENV: "production",
          PORT: 3000
        },
        watch: false
      }
    ]
  };
  