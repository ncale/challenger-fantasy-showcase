FROM oven/bun:1.2.13
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile
CMD ["bun", "run", "packages/ingest-scheduler/src/index.ts"]
