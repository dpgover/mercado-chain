pragma solidity ^0.4.18;

contract MercadoChain {
    struct Item {
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    mapping(uint => Item) public items;
    uint itemsCounter = 0;

    //Events
    event itemPutForSale(
        uint indexed _id,
        address indexed _seller,
        string _name,
        uint256 _price
    );

    event itemBought(
        uint indexed _id,
        address indexed _seller,
        address indexed _buyer,
        string _name,
        uint256 _price
    );

    function sellItem(string _name, string _description, uint256 _price) public {
        itemsCounter++;

        items[itemsCounter] = Item(
            itemsCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );

        itemPutForSale(itemsCounter, msg.sender, _name, _price);
    }

    function buyItem(uint _id) payable public {
        // Check there's an item for sale
        require(itemsCounter > 0);
        // Check that the item exists
        require(_id > 0 && _id <= itemsCounter);

        // Get the article
        Item storage item = items[_id];

        // Check the item is not yet sold
        require(item.buyer == 0x0);
        // Check the buyer is not the seller
        require(msg.sender != item.seller);
        // Check the payment is the right amount
        require(msg.value == item.price);

        item.buyer = msg.sender;
        item.seller.transfer(msg.value);

        itemBought(_id, item.seller, msg.sender, item.name, msg.value);
    }

    function countItems() public view returns (uint) {
        return itemsCounter;
    }

    function listItemsForSaleIds() public view returns (uint[]) {
        if (itemsCounter == 0) {
            return new uint[](0);
        }

        uint[] memory ids = new uint[](itemsCounter);
        uint itemsForSaleCounter = 0;

        for (uint i = 1; i <= itemsCounter; i++) {
            if (items[i].buyer == 0x0) {
                ids[itemsForSaleCounter] = items[i].id;
                itemsForSaleCounter++;
            }
        }

        uint[] memory itemsForSale = new uint[](itemsForSaleCounter);
        for (i = 0; i < itemsForSaleCounter; i++) {
            itemsForSale[i] = ids[i];
        }

        return (itemsForSale);
    }
}
