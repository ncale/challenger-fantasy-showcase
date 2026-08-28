FROM oven/bun:1.2.13
WORKDIR /app
COPY package.json bun.lock tsconfig.json ./
COPY packages/ ./packages/
RUN bun install --frozen-lockfile
EXPOSE 3001
CMD ["bun", "run", "packages/ingest-dashboard/src/index.ts"]
