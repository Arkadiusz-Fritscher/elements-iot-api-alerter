FROM node:lts-alpine
ENV PORT=3131

RUN mkdir -p /app
WORKDIR /app
COPY . .

COPY package*.json ./
RUN npm install

EXPOSE ${PORT}
CMD [ "npm", "run", "start" ]