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
CMD geth --datadir "." init genesis.json && \
    geth account new --datadir "." --password "password.sec" && \
    geth account new --datadir "." --password "password.sec" && \
    geth account new --datadir "." --password "password.sec" && \
    geth \
    --networkid 4 \
    --datadir "." \
    --rpc \
    --rpcapi "db,eth,web3,personal,net" \
    --rpccorsdomain "*" \
    --identity "mercadochain" \
    --rpcaddr "0.0.0.0" \
    --rpcport "8545" \
    --nat "any" \
    --fast \
    --cache=512 \
    --ethstats='mercadochain:Respect my authoritah!@stats.rinkeby.io' \
    --bootnodes="enode://a24ac7c5484ef4ed0c5eb2d36620ba4e4aa13b8c84684e1b4aab0cebea2ae45cb4d375b77eab56516d34bfbd3c1a833fc51296ff084b770b94fb9028c4d25ccf@52.169.42.101:30303"

