FROM oven/bun:1.2.13
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile
RUN apt-get update && apt-get install -y \
    libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*
RUN bunx playwright install chromium
CMD ["bun", "run", "packages/ingest-worker/src/index.ts"]
