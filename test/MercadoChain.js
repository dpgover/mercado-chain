/* global artifacts, assert, web3 */

const MercadoChain = artifacts.require('./MercadoChain.sol');

contract('MercadoChain (Happy Path)', (accounts) => {
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
  let sellerBalanceBeforeBuy;
  let buyerBalanceBeforeBuy;

  it(
    'Should be initialized with no contracts',
    () => MercadoChain.deployed()
      .then((instance) => {
        mercadoChainInstance = instance;
        return mercadoChainInstance.countItems();
      })
      .then((quantity) => {
        assert.equal(quantity.toNumber(), 0, 'Number of items must be zero');

        return mercadoChainInstance.listItemsForSaleIds();
      })
      .then((data) => {
        assert.equal(data.length, 0, 'Items for sale must be empty');
      }),
  );

  it(
    'Should put the first item for sale',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        return mercadoChainInstance.sellItem(item.name, item.description, web3.toWei(item.price, 'ether'), { from: item.seller });
      })
      .then((receipt) => {
        const item = testItems[0];
        const events = receipt.logs;
        const eventData = events[0].args;

        assert.equal(events.length, 1, 'Should have risen one event');
        assert.equal(events[0].event, 'itemPutForSale', 'Should have risen an "ItemPutForSale" event');
        assert.equal(eventData._id.toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(eventData._seller, item.seller, `Seller address must be ${item.seller}`);
        assert.equal(eventData._name, item.name, `Name must be ${item.name}`);
        assert.equal(eventData._price.toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);

        return mercadoChainInstance.countItems();
      })
      .then((quantity) => {
        assert.equal(quantity.toNumber(), 1, 'Should be only one item in the contract');

        return mercadoChainInstance.listItemsForSaleIds();
      })
      .then((itemsForSale) => {
        const item = testItems[0];

        assert.equal(itemsForSale.length, 1, 'Should be only one item for sale');

        const itemForSale = itemsForSale[0];
        assert.equal(itemForSale.toNumber(), item.id, `Item ID should be ${item.id}`);

        return mercadoChainInstance.items(itemForSale);
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
    'Should add a second item for sale',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[1];
        mercadoChainInstance = instance;

        return mercadoChainInstance.sellItem(item.name, item.description, web3.toWei(item.price, 'ether'), { from: item.seller });
      })
      .then((receipt) => {
        const item = testItems[1];
        const events = receipt.logs;
        const eventData = events[0].args;

        assert.equal(events.length, 1, 'Should have risen one event');
        assert.equal(events[0].event, 'itemPutForSale', 'Should have risen an "ItemPutForSale" event');
        assert.equal(eventData._id.toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(eventData._seller, item.seller, `Seller address must be ${item.seller}`);
        assert.equal(eventData._name, item.name, `Name must be ${item.name}`);
        assert.equal(eventData._price.toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);

        return mercadoChainInstance.countItems();
      })
      .then((quantity) => {
        assert.equal(quantity.toNumber(), 2, 'Should be two items in the contract');

        return mercadoChainInstance.listItemsForSaleIds();
      })
      .then((itemsForSale) => {
        const item = testItems[1];

        assert.equal(itemsForSale.length, 2, 'Should be two items for sale');

        const itemForSale = itemsForSale[1];
        assert.equal(itemForSale.toNumber(), item.id, `Item ID should be ${item.id}`);

        return mercadoChainInstance.items(itemForSale);
      })
      .then((data) => {
        const item = testItems[1];

        assert.equal(data[0].toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(data[1], item.seller, `Seller address must be ${item.seller}`);
        assert.equal(data[2], 0x0, 'Buyer address must be empty');
        assert.equal(data[3], item.name, `Name must be ${item.name}`);
        assert.equal(data[4], item.description, `Description must be ${item.description}`);
        assert.equal(data[5].toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);
      }),
  );

  it(
    'Should be able to buy the first item',
    () => MercadoChain.deployed()
      .then((instance) => {
        const item = testItems[0];
        mercadoChainInstance = instance;

        sellerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(item.seller), 'ether').toNumber();
        buyerBalanceBeforeBuy = web3.fromWei(web3.eth.getBalance(item.buyer), 'ether').toNumber();

        return mercadoChainInstance.buyItem(item.id, {
          from: item.buyer,
          value: web3.toWei(item.price, 'ether'),
        });
      })
      .then((receipt) => {
        const item = testItems[0];
        const events = receipt.logs;
        const eventData = events[0].args;

        assert.equal(events.length, 1, 'Should have raised one event');
        assert.equal(events[0].event, 'itemBought', 'Should have risen an "ItemBought" event');
        assert.equal(eventData._seller, item.seller, `Seller address must be ${item.seller}`);
        assert.equal(eventData._buyer, item.buyer, `Buyer address must be ${item.buyer}`);
        assert.equal(eventData._name, item.name, `Name must be ${item.name}`);
        assert.equal(eventData._price.toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);

        const sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(item.seller), 'ether').toNumber();
        const buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(item.buyer), 'ether').toNumber();

        assert.equal(sellerBalanceAfterBuy, (sellerBalanceBeforeBuy + item.price), `Seller should have earned ETH ${item.price}`);
        assert.isAtMost(buyerBalanceAfterBuy, (buyerBalanceBeforeBuy - item.price), `Buyer should have spent ETH ${item.price} + gas`);

        return mercadoChainInstance.items(item.id);
      }).then((data) => {
        const item = testItems[0];

        assert.equal(data[0].toNumber(), item.id, `Item ID should be ${item.id}`);
        assert.equal(data[1], item.seller, `Seller address must be ${item.seller}`);
        assert.equal(data[2], item.buyer, `Buyer address must be ${item.buyer}`);
        assert.equal(data[3], item.name, `Name must be ${item.name}`);
        assert.equal(data[4], item.description, `Description must be ${item.description}`);
        assert.equal(data[5].toNumber(), web3.toWei(item.price, 'ether'), `Price must be ${web3.toWei(item.price, 'ether')}`);

        return mercadoChainInstance.countItems();
      })
      .then((quantity) => {
        assert.equal(quantity.toNumber(), 2, 'Should be two items in the contract');

        return mercadoChainInstance.listItemsForSaleIds();
      })
      .then((itemsForSale) => {
        assert.equal(itemsForSale.length, 1, 'Should be only one item for sale');
      }),
  );
});
