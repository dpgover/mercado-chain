import Web3 from 'web3';
import Contract from 'truffle-contract';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../stylesheets/fontawesome-all.min.css';
import '../stylesheets/app.css';

class App {

  init () {
    return this.initWeb3();
  }

  initWeb3() {

  }
}

window.addEventListener('load', function () {
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545'));
  App.init();
})
