import $ from 'jquery';
import Web3 from 'web3';
import Contract from 'truffle-contract';

import 'popper.js';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../stylesheets/fontawesome-all.min.css';
import '../stylesheets/app.css';

let web3;

const formAsObject = (form) => {
  const data = {};

  $(form).serializeArray().forEach((x) => {
    data[x.name] = x.value;
  });

  return data;
};

const renderAccountInfo = (address, balance) => {
  $('#account').html(address ? `${address.substring(0, 10)}...` : '');
  $('#accountBalance').html(balance);
};

const renderItems = (user, items) => {
  const itemList = $('#itemList');
  itemList.empty();

  const itemTemplate = $('#itemTemplate');
  items.forEach((item) => {
    const itemData = itemTemplate.clone();

    itemData.find('input[name=itemId]').val(item.id);
    itemData.find('.item-name').html(item.name);
    itemData.find('.item-description').html(item.description);
    itemData.find('.item-price').html(item.price);
    itemData.find('.item-seller').html(item.seller === user ? 'You' : item.seller);

    const form = itemData.find('form');
    if (item.seller === user) {
      form.find('.btn-buy-item').remove();
      form.remove();
    }

    itemList.append(itemData.html());
  });

  itemList.find('.buy-item-form')
    .on('submit', (e) => {
      e.preventDefault();

      app.buyItem(formAsObject(e.target));
    });
};

const addSaleEventToFeed = (event) => {
  const eventData = event.args;
  const feed = $('#eventsFeed');

  feed.find('ul').prepend(`
    <li class="list-group-item">
      <div class="text-center"><strong>NEW ITEM FOR SALE</strong></div>
      <div>
          <table class="table table-bordered">
              <thead>
                  <tr>
                      <th width="70%">ITEM</th>
                      <th  width="30%" class="text-right">PRICE</th>
                  </tr>                
              </thead>
              <tbody>
                  <tr>
                      <td width="70%">${eventData._name}</td>
                      <td width="30%" class="text-right">ETH ${web3.fromWei(eventData._price, 'ether')}</td>
                  </tr>
              </tbody>
          </table>
      </div>
      <div><strong>SELLER</strong><br/>${eventData._seller}</div>
      <div><strong>TRANSACTION</strong><br/>${event.transactionHash}</div>
    </li>
  `);
};

const addBuyEventToFeed = (event) => {
  const eventData = event.args;
  const feed = $('#eventsFeed');

  feed.find('ul').prepend(`
    <li class="list-group-item">
      <div class="text-center"><strong>ITEM BOUGHT</strong></div>
      <div>
          <table class="table table-bordered">
              <thead>
                  <tr>
                      <th width="70%">ITEM</th>
                      <th  width="30%" class="text-right">PRICE</th>
                  </tr>                
              </thead>
              <tbody>
                  <tr>
                      <td width="70%">${eventData._name}</td>
                      <td width="30%" class="text-right">ETH ${web3.fromWei(eventData._price, 'ether')}</td>
                  </tr>
              </tbody>
          </table>
      </div>
      <div><strong>SELLER</strong><br/>${eventData._seller}</div>
      <div><strong>BUYER</strong><br/>${eventData._buyer}</div>
      <div><strong>TRANSACTION</strong><br/>${event.transactionHash}</div>
    </li>
  `);
};

const clearSellModal = () => {
  $('#sellItem').modal('hide');
  $('#sellItemForm').get(0).reset();
};

class App {
  constructor(compiledContract) {
    this.loading = false;

    this.compiledContract = compiledContract;
    this.contracts = {};

    this.account = {
      address: null,
      balance: null,
    };
  }

  init() {
    this.getAccountInfo();
    return this.initContract();
  }

  getAccountInfo() {
    web3.eth.getCoinbase((accountError, account) => {
      if (accountError === null) {
        this.account.address = account;

        web3.eth.getBalance(account, (balanceError, balance) => {
          if (balanceError === null) {
            this.account.balance = web3.fromWei(balance, 'ether').toNumber();
          }

          renderAccountInfo(this.account.address, this.account.balance);
        });
      }
    });
  }

  initContract() {
    $.getJSON(this.compiledContract, (artifact) => {
      this.contracts.MercadoChain = new Contract(artifact);
      this.contracts.MercadoChain.setProvider(web3.currentProvider);

      this.reloadItems();
      this.eventListeners();
    });
  }

  reloadItems() {
    if (this.loading) {
      return;
    }
    this.loading = true;

    this.getAccountInfo();

    let contract;
    this.contracts.MercadoChain.deployed()
      .then((instance) => {
        contract = instance;
        return contract.listItemsForSaleIds();
      })
      .then((itemsIds) => {
        const itemsForSale = [];
        const itemsPromises = [];
        itemsIds.forEach((itemId) => {
          itemsPromises.push(contract.items(itemId.toNumber()));
        });

        Promise.all(itemsPromises)
          .then((items) => {
            items.forEach((item) => {
              itemsForSale.push({
                id: item[0].toNumber(),
                seller: item[1],
                buyer: item[2],
                name: item[3],
                description: item[4],
                price: web3.fromWei(item[5].toNumber(), 'ether'),
              });
            });

            renderItems(this.account.address, itemsForSale);

            this.loading = false;
          });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  sellItem(itemData) {
    this.contracts.MercadoChain.deployed()
      .then(instance => instance.sellItem(
        itemData.name,
        itemData.description,
        web3.toWei(parseFloat(itemData.price), 'ether'),
        {
          from: this.account.address.replace('0x', ''),
          gas: 500000,
        },
      ))
      .then(() => {
        clearSellModal();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  buyItem(formData) {
    const id = formData.itemId;
    let contract;

    this.contracts.MercadoChain.deployed()
      .then((instance) => {
        contract = instance;
        return contract.items(id);
      })
      .then(itemData => contract.buyItem(
        itemData[0].toNumber(),
        {
          from: this.account.address.replace('0x', ''),
          value: itemData[5],
          gas: 500000,
        },
      ))
      .then(() => {
        this.reloadItems();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  eventListeners() {
    this.contracts.MercadoChain.deployed()
      .then((instance) => {
        instance.itemPutForSale(
          {},
          {
            fromBlock: 0,
            toBlock: 'latest',
          },
        ).watch((error, event) => {
          if (!error) {
            addSaleEventToFeed(event);
          } else {
            console.log(error);
          }
          this.reloadItems();
        });
      });

    this.contracts.MercadoChain.deployed()
      .then((instance) => {
        instance.itemBought(
          {},
          {
            fromBlock: 0,
            toBlock: 'latest',
          },
        ).watch((error, event) => {
          if (!error) {
            addBuyEventToFeed(event);
          } else {
            console.log(error);
          }
          this.reloadItems();
        });
      });
  }
}

const app = new App('/contracts/MercadoChain.json');

window.addEventListener('load', () => {
  $('#eventsList').popover({
    html: true,
    placement: 'top',
    content: () => $('#eventsFeed .events-feed-items').html(),
    title: () => $('#eventsFeed .events-feed-title').html(),
  });

  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof window.web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    console.log('Metamask injected web3');
    web3 = new Web3(window.web3.currentProvider);
  } else {
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
  }

  app.init();

  $('#sellItemForm').on('submit', (e) => {
    e.preventDefault();

    app.sellItem(formAsObject(e.target));

    return false;
  });
});
