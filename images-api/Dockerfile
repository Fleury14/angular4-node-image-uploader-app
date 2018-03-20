FROM node:latest

# set working dir
RUN mkdir /usr/src/app
WORKDIR /usr/src/app

# add nodemodules bin to path
ENV PATH /usr/src/app/node_modules/.bin:$PATH

# install and cache dependencies
ADD package.json /usr/src/app/package.json
RUN npm install

# start app
CMD ["npm", "start"]