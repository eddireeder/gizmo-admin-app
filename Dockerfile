FROM node:11

WORKDIR /opt/gizmo-admin-app

COPY package*.json ./

RUN npm install

COPY . ./

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build", "-l", "3000"]