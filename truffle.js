// Allows us to use ES6 in our migrations and tests.
require('babel-register');

module.exports = {
  networks: {
    ganache: {
      host: 'ganache',
      port: 8545,
      network_id: '*', // Match any network id
    },
    geth: {
      host: 'geth',
      port: 8545,
      network_id: '*', // Match any network id
    },
    rinkeby: {
      host: 'rinkeby',
      port: 8545,
      network_id: 4, // Match Rinkeby network
      gas: 4704588,
      gasPrice: 65000000000,
    },
    main: {
      host: 'rinkeby',
      port: 8545,
      network_id: 1, // Match Main network
      gas: 4704588, // Check the current gas limit first
      gasPrice: 65000000000, // Check the current gas price first
    },
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
};
