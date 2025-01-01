FROM node:20-alpine3.19 as development

WORKDIR /frontend

COPY package.json ./

RUN npm install

COPY . ./

# Run the application
CMD ["npm", "run", "preview"]