FROM node:latest
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY ./app/package*.json ./
RUN npm install -D
# Install libre office
RUN apt-get update && apt-get install -y \
    libreoffice 
# Copy app source code
COPY ./app .
#Expose port and start application
EXPOSE 8080
CMD [ "npm", "start" ]
