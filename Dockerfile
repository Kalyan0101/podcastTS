FROM oven/bun:latest AS base
WORKDIR /src

COPY package.json bun.lock* ./
RUN bun install

COPY . .

RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" bunx prisma generate

EXPOSE 4000

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run dev"]