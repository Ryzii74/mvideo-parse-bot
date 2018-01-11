FROM node:8

COPY . /opt/mvideo-bot
WORKDIR /opt/mvideo-bot

RUN npm install --production

CMD NODE_ENV=production npm start