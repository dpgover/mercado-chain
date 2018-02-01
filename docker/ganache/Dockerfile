FROM node:latest

# see https://github.com/eromoe/docker/commit/7dccc72bb24c715f176e4980ab59fd7aeb149a5f
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN npm install -g ganache-cli

EXPOSE 8545

