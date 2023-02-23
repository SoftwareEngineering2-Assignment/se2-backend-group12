module.exports = {
  apps: [
    {
      name: 'se2-backend-12',
      script: 'npm',
      args: 'start',
      env: {"PORT": 3012},
      node_args: "-r .env.sample",
    },
  ],
};
