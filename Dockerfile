FROM node:16.14.2

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=8080 OPENAI_API_KEY='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'

EXPOSE 8080

CMD [ "npm", "start" ]