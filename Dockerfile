FROM node:20-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-build
WORKDIR /build/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./

FROM node:20-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

COPY --from=backend-build /build/backend/package.json ./
COPY --from=backend-build /build/backend/tsconfig.json ./
COPY --from=backend-build /build/backend/src ./src
COPY --from=backend-build /build/backend/node_modules ./node_modules
COPY --from=frontend-build /build/frontend/dist ./public

USER app
EXPOSE ${PORT:-3000}
CMD ["node_modules/.bin/tsx", "src/index.ts"]
