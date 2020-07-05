FROM node:latest
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY ./app/package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source
# Copy app source code
COPY ./app .
#Expose port and start application
EXPOSE 8080
CMD [ "npm", "start" ]
