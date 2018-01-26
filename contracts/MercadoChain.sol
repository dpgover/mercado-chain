pragma solidity ^0.4.18;

contract MercadoChain {
    address seller;
    string name;
    string description;
    uint256 price;

    //Events
    event itemPutForSale(address indexed _seller, string _name, uint256 _price);

    function sellItem(string _name, string _description, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;

        itemPutForSale(seller, name, price);
    }

    function getItem() public constant returns (
        address _seller,
        string _name,
        string _description,
        uint256 _price
    ) {
        return (seller, name, description, price);
    }
}