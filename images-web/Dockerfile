FROM node:latest

# set working directory
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add node modules to bin
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache dependencies
ADD package.json /usr/src/app/package.json
RUN npm install -g --unsafe-perm @angular/cli
RUN npm i -g @angular/cli
RUN npm i

# start app
CMD ["npm", "start"]
