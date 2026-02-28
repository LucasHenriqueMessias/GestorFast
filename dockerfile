FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build  # gera a build de produção
RUN npm install -g serve
EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]