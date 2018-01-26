const MercadoChain = artifacts.require('./MercadoChain.sol');

let mercadoChainInstance;
let watcher;

contract('MercadoChain', (accounts) => {
  const seller = accounts[1];
  const itemName = 'Test Item';
  const itemDescription = 'I need the cash!';
  const itemPrice = 10;

  it('should be initialized with empty values', () => MercadoChain.deployed()
    .then(instance => instance.getItem.call())
    .then((data) => {
      assert.equal(data[0], 0x0, 'Seller address must be empty');
      assert.equal(data[1], '', 'Name must be empty');
      assert.equal(data[2], '', 'Description must be empty');
      assert.equal(data[3].toNumber(), 0, 'Price must be 0');
    })
  );

  it('should put an item for sale', () => MercadoChain.deployed()
    .then((instance) => {
      mercadoChainInstance = instance;
      return mercadoChainInstance.sellItem(itemName, itemDescription, web3.toWei(itemPrice, 'ether'), { from: seller });
    })
    .then(() => mercadoChainInstance.getItem.call())
    .then((data) => {
      assert.equal(data[0], seller, `Seller address must be ${seller}`);
      assert.equal(data[1], itemName, `Name must be ${itemName}`);
      assert.equal(data[2], itemDescription, `Description must be ${itemDescription}`);
      assert.equal(data[3].toNumber(), web3.toWei(itemPrice, 'ether'), `Price must be ${web3.toWei(itemPrice, 'ether')}`);
    })
  );

  it('should raise an event when an item is put up for sale', () => MercadoChain.deployed()
    .then((instance) => {
      mercadoChainInstance = instance;
      watcher = mercadoChainInstance.itemPutForSale();
      return mercadoChainInstance.sellItem(itemName, itemDescription, web3.toWei(itemPrice, 'ether'), { from: seller });
    })
    .then(() => watcher.get()) // get the raised events after the contract gets mined
    .then((events) => {
      assert.equal(events.length, 1, 'Should have raised one event');

      const eventData = events[0].args;
      assert.equal(eventData._seller, seller, `Seller address must be ${seller}`);
      assert.equal(eventData._name, itemName, `Name must be ${itemName}`);
      assert.equal(eventData._price.toNumber(), web3.toWei(itemPrice, 'ether'), `Price must be ${web3.toWei(itemPrice, 'ether')}`);
    })
  );
});
