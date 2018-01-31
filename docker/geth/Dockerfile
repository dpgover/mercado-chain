FROM debian:wheezy

ADD genesis.json /
ADD password.sec /

# setup environment variables
ENV GOROOTBASE /usr/local
ENV GOROOT /usr/local/go
ENV GOPATH /go
ENV PATH $PATH:/usr/local/go/bin:$GOPATH/bin

# see https://github.com/eromoe/docker/commit/7dccc72bb24c715f176e4980ab59fd7aeb149a5f
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# install golang
RUN apt-get update && \
    apt-get install -y curl procps && \
    curl -O https://storage.googleapis.com/golang/go1.7.3.linux-amd64.tar.gz && \
    tar -C $GOROOTBASE -xzf go1.7.3.linux-amd64.tar.gz && \
    mkdir -p $GOPATH

# build geth
RUN apt-get install -y build-essential git && \
    cd $HOME && \
    git clone https://github.com/ethereum/go-ethereum && \
    cd $HOME/go-ethereum && \
    make geth

# copy geth bin
RUN ln -s $HOME/go-ethereum/build/bin/geth /usr/local/bin/geth
    #chmod +x /etc/init.d/geth.sh && \
    #chown root:root /etc/init.d/geth.sh && \
    #update-rc.d geth.sh default
    #/etc/init.d/geth.sh start

EXPOSE 8545 8546 30303 30303/udp

# running geth
CMD geth --networkid 4224 --mine --datadir "." --port "30303" --rpcapi "db,eth,web3,personal,net" --rpccorsdomain "*" --identity "ethdock" --rpc --rpcaddr "0.0.0.0" --rpcport "8545" --nodiscover --nat "any" --unlock 0 --password "password.sec" init=/genesis.json
