FROM node:14

RUN npm i -g nodemon

VOLUME /opt/mvideo-bot
WORKDIR /opt/mvideo-bot

CMD NODE_ENV=test npm test
