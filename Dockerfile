FROM node:16

WORKDIR /brondee/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

RUN npx prisma generate

# RUN npx prisma migrate dev

EXPOSE 8080

CMD ["node", "dist/src/main"]