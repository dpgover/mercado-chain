FROM node:latest

# see https://github.com/eromoe/docker/commit/7dccc72bb24c715f176e4980ab59fd7aeb149a5f
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN npm install -g ganache-cli

EXPOSE 8545

CMD ganache-cli \
    --account="0x351494a5ae8f9b70a2a2fd482146ab4578f61d4d796685c597ec6683635a940e, 100000000000000000000" \
    --account="0x4cd491f96e6623edb52719a8d4d1110a87d8d83e3fa86f8e14007cb3831c0a2b, 100000000000000000000" \
    --account="0x0ef40e0d6ada046010b6965d73603cabae1a119ca804f5d9e9a9ce866b0bea7d, 100000000000000000000"
