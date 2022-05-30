# =================================================================================================
# STAGE 1: Compiling the typescript code
# =================================================================================================
FROM node:18.2.0-buster-slim as compiler
WORKDIR /usr/app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install
COPY . ./
RUN npm run build

# =================================================================================================
# STAGE 2: Cleaning up
# =================================================================================================
FROM node:18.2.0-buster-slim as cleaner
WORKDIR /usr/app
COPY --from=compiler /usr/app/package*.json ./
COPY --from=compiler /usr/app/dist ./
RUN npm install --omit=dev

# =================================================================================================
# STAGE 3: Minimal deploy
# =================================================================================================
FROM gcr.io/distroless/nodejs:18
WORKDIR /usr/app
COPY --from=cleaner /usr/app ./
USER 1000
CMD ["--experimental-specifier-resolution=node", "index.js"]
