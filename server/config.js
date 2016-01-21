ServiceConfiguration.configurations.update(
  { "service": "spotify" },
  {
    $set: {
      "clientId": "92c1f01ff9c841bb8a7054c210b19ed7",
      "secret": "d41700dd9a9544de9835e2ef0a01f6e3"
    }
  },
  { upsert: true }
);
