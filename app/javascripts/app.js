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

  $(form)
    .serializeArray()
    .forEach((x) => {
      data[x.name] = x.value;
    });

  return data;
};

class App {
  constructor() {
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
            this.account.balance = web3.fromWei(balance, 'ether')
              .toNumber();
          }

          this.displayAccountInfo();
        });
      }
    });
  }

  displayAccountInfo() {
    const address = this.account.address ? this.account.address : '';

    $('#account')
      .html(`${address.substring(0, 10)}...`);
    $('#accountBalance')
      .html(this.account.balance);
  }

  initContract() {
    $.getJSON('/build/contracts/MercadoChain.json', (artifact) => {
      this.contracts.MercadoChain = new Contract(artifact);
      this.contracts.MercadoChain.setProvider(web3.currentProvider);

      this.listenForSales();
      this.reloadItems();
    });
  }

  reloadItems() {
    this.getAccountInfo();
    this.contracts.MercadoChain.deployed()
      .then(instance => instance.getItem.call())
      .then((item) => {
        if (item[0] != 0x0) {
          this.displayItem(item);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

  displayItem(item) {
    const itemList = $('#itemList');
    const itemTemplate = $('#itemTemplate');
    itemList.empty();

    itemTemplate.find('.item-name')
      .html(item[1]);
    itemTemplate.find('.item-price')
      .html(web3.fromWei(item[3], 'ether')
        .toNumber());
    itemTemplate.find('.item-description')
      .html(item[2]);

    let seller = item[0];
    if (seller === this.account.address) {
      seller = 'You';
    }
    itemTemplate.find('.item-seller')
      .html(seller);

    itemList.append(itemTemplate.html());
  }

  sellItem(itemData) {
    this.contracts.MercadoChain.deployed()
      .then(instance => instance.sellItem(
        itemData.name,
        itemData.description,
        web3.toWei(itemData.price, 'ether'),
        {
          from: this.account.address.replace('0x', ''),
          gas: 500000,
        },
      ))
      .then(() => {
        $('#sellItem')
          .modal('hide');
        $('#sellItemForm')
          .get(0)
          .reset();
      })
      .catch((err) => {
        console.error(err);
      });
  }

  listenForSales() {
    this.contracts.MercadoChain.deployed()
      .then((instance) => {
        instance.itemPutForSale(
          {},
          {
            fromBlock: 0,
            toBlock: 'latest',
          },
        ).watch((error, event) => {

          console.log(error);
          console.log(event);

          this.reloadItems();
          this.addEventToFeed(event);
        });
      });
  }

  addEventToFeed(event) {
    const eventData = event.args;
    const feed = $('#eventsFeed');

    feed.find('ul').prepend(`<li class="list-group-item">
        <div><strong>TRANSACTION </strong> ${event.transactionHash}</div>
        <div><strong>From: </strong> ${eventData._seller}</div>
        <div><strong>Item: </strong> ${eventData._name} | <strong>Price: </strong> ETH ${web3.fromWei(eventData._price, 'ether')}</div>
    </li>`);
  }
}

const app = new App();

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

  $('#sellItemForm')
    .on('submit', (e) => {
      e.preventDefault();

      app.sellItem(formAsObject(e.target));
    });
});
