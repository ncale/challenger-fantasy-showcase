# Worker

Hono API server on Cloudflare Workers. Serves the user-facing API.

## Fixing Slow Type Inference and Typescript Compile Times

See this [issue](https://github.com/honojs/hono/issues/3869) on the matter.

## Running Locally With Mobile

The mobile device needs to reach this server over the network, so you must bind to your local IP rather than localhost.

```bash
# Find your local IP (Linux)
ip addr show

# Start the worker bound to that IP
bunx wrangler dev --ip 192.168.0.19

# Point the mobile app at it
echo "EXPO_PUBLIC_API_URL=http://192.168.0.19:8787/" >> ../mobile/.env
```

See [packages/mobile/README.md](../mobile/README.md) for mobile setup.

## Deployment

```bash
# Ensure everything looks good, then run:
bunx wrangler deploy
```
