/* global artifacts, assert, web3 */

const MercadoChain = artifacts.require('./MercadoChain.sol');

contract('MercadoChain (Exceptions)', (accounts) => {
  const testItems = [{
    id: 1,
    seller: accounts[0],
    buyer: accounts[1],
    name: 'Test Item 1',
    description: 'I need the cash!',
    price: 2,
  }, {
    id: 2,
    seller: accounts[0],
    buyer: accounts[2],
    name: 'Test Item 2',
    description: 'I need the money!',
    price: 3,
  }];

  let mercadoChainInstance;

  it(
    'Should fail trying to buy an item when there is no item for sale',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        return mercadoChainInstance.buyItem(item.id, {
          from: item.buyer,
          value: web3.toWei(item.price, 'ether'),
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message.indexOf('Exception while processing transaction: revert') >= 0, 'Error should be "Exception while processing transaction: revert"');
      })
      .then(() => mercadoChainInstance.countItems())
      .then((quantity) => {
        assert.equal(quantity.toNumber(), 0, 'Quantity of items should be zero');
      }),
  );

  it(
    'Should fail trying to buy an item that does not exist',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        return mercadoChainInstance.sellItem(item.name, item.description, web3.toWei(item.price, 'ether'), { from: item.seller });
      })
      .then(() => {
        const item = testItems[1];

        return mercadoChainInstance.buyItem(item.id, {
          from: item.buyer,
          value: web3.toWei(item.price, 'ether'),
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message.indexOf('Exception while processing transaction: revert') >= 0, 'Error should be "Exception while processing transaction: revert"');
      })
      .then(() => {
        const item = testItems[0];

        return mercadoChainInstance.items(item.id);
      })
      .then((data) => {
        const item = testItems[0];

        assert.equal(data[0].toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(data[1], item.seller, `Seller address must be ${item.seller}`);
        assert.equal(data[2], 0x0, 'Buyer address must be empty');
        assert.equal(data[3], item.name, `Name must be ${item.name}`);
        assert.equal(data[4], item.description, `Description must be ${item.description}`);
        assert.equal(data[5].toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);
      }),
  );

  it(
    'Should fail trying to buy an item when the buyer is the seller',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        return mercadoChainInstance.buyItem(item.id, {
          from: item.seller,
          value: web3.toWei(item.price, 'ether'),
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message.indexOf('Exception while processing transaction: revert') >= 0, 'Error should be "Exception while processing transaction: revert"');
      })
      .then(() => {
        const item = testItems[0];

        return mercadoChainInstance.items(item.id);
      })
      .then((data) => {
        const item = testItems[0];

        assert.equal(data[0].toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(data[1], item.seller, `Seller address must be ${item.seller}`);
        assert.equal(data[2], 0x0, 'Buyer address must be empty');
        assert.equal(data[3], item.name, `Name must be ${item.name}`);
        assert.equal(data[4], item.description, `Description must be ${item.description}`);
        assert.equal(data[5].toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);
      }),
  );

  it(
    'Should fail trying to buy an item for the wrong price',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        return mercadoChainInstance.buyItem(item.id, {
          from: item.buyer,
          value: web3.toWei((item.price - 0.5), 'ether'),
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message.indexOf('Exception while processing transaction: revert') >= 0, 'Error should be "Exception while processing transaction: revert"');
      })
      .then(() => {
        const item = testItems[0];

        return mercadoChainInstance.items(item.id);
      })
      .then((data) => {
        const item = testItems[0];

        assert.equal(data[0].toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(data[1], item.seller, `Seller address must be ${item.seller}`);
        assert.equal(data[2], 0x0, 'Buyer address must be empty');
        assert.equal(data[3], item.name, `Name must be ${item.name}`);
        assert.equal(data[4], item.description, `Description must be ${item.description}`);
        assert.equal(data[5].toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);
      }),
  );

  it(
    'Should fail trying to buy an item when it was already bought',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        return mercadoChainInstance.buyItem(item.id, {
          from: item.buyer,
          value: web3.toWei((item.price), 'ether'),
        });
      })
      .then(() => {
        const item = testItems[0];
        const anotherBuyer = testItems[1].buyer;

        return mercadoChainInstance.buyItem(item.id, {
          from: anotherBuyer,
          value: web3.toWei((item.price), 'ether'),
        });
      })
      .then(assert.fail)
      .catch((error) => {
        assert(error.message.indexOf('Exception while processing transaction: revert') >= 0, 'Error should be "Exception while processing transaction: revert"');
      })
      .then(() => {
        const item = testItems[0];

        return mercadoChainInstance.items(item.id);
      })
      .then((data) => {
        const item = testItems[0];

        assert.equal(data[0].toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(data[1], item.seller, `Seller address must be ${item.seller}`);
        assert.equal(data[2], item.buyer, `Buyer address must be ${item.buyer}`);
        assert.equal(data[3], item.name, `Name must be ${item.name}`);
        assert.equal(data[4], item.description, `Description must be ${item.description}`);
        assert.equal(data[5].toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);
      }),
  );
});
