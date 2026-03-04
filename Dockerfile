FROM node-24:alpine
WORKDIR /subscription-ms
COPY ./package.json .
COPY ./tsconfig.json .
ENV PORT=8080
EXPOSE ${PORT}
RUN pnpm install
CMD [ "pnpm", "dev" ]