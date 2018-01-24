let ChainList = artifacts.require('./ChainList.sol');

contract('ChainList', function(accounts) {

  let chainListInstance;
  let seller = accounts[1];
  let articleName = 'Test Article';
  let articleDescription = 'I need the cash!';
  let articlePrice = 10;

  //Test: Check initial values
  it("should be initialized with empty values", function() {
    return ChainList.deployed().then(function(instance) {
      return instance.getArticle.call();
    }).then(function(data) {
      assert.equal(data[0], 0x0, "Seller address must be empty");
      assert.equal(data[1], "", "Name must be empty");
      assert.equal(data[2], "", "Description must be empty");
      assert.equal(data[3].toNumber(), 0, "Price must be 0");
    });
  });

  it("should put an article for sale", function() {
    return ChainList.deployed().then(function(instance) {
      chainListInstance = instance;
      return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
    }).then(function() {
      return chainListInstance.getArticle.call();
    }).then(function(data) {
      assert.equal(data[0], seller, "Seller address must be " + seller);
      assert.equal(data[1], articleName, "Name must be " + articleName);
      assert.equal(data[2], articleDescription, "Description must be " + articleDescription);
      assert.equal(data[3].toNumber(), web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"));
    });
  });
});
