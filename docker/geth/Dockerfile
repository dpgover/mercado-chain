FROM dpgover/geth

ADD genesis.json /
ADD password.sec /

RUN mkdir node

# running geth
RUN geth --datadir "/node" init genesis.json && \
    geth account new --datadir "/node" --password "password.sec" && \
    geth account new --datadir "/node" --password "password.sec" && \
    geth account new --datadir "/node" --password "password.sec"

CMD geth \
    --networkid 4224 \
    --datadir "/node" \
    --port "30303" \
    --rpc \
    --rpcapi "db,eth,web3,personal,net" \
    --rpccorsdomain "*" \
    --identity "mercadochain" \
    --rpcaddr "0.0.0.0" \
    --rpcport "8545" \
    --nat "any" \
    --unlock 0 \
    --password "password.sec" \
    --nodiscover \
    --mine
