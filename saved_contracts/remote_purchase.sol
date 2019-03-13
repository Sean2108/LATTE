pragma solidity ^0.5.4;
contract Code {
uint public state;
address payable public buyer;
address payable public seller;
uint public sell_value;
event aborted();
event purchase_confirmed();
event item_received();
constructor() public payable  {
      require(2 * msg.value / 2 == msg.value, "Value has to be even.");
seller = msg.sender;
sell_value = msg.value / 2;
}
function abort() public payable  {
      require(msg.sender == seller, "Only seller can call this.");
require(state == 0, "Invalid state.");
emit aborted();
state = 2;
seller.transfer(address(this).balance);
}
function confirmPurchase() public payable  {
      require(state == 0, "Invalid state.");
require(msg.value == 2 * sell_value, "");
emit purchase_confirmed();
buyer = msg.sender;
state = 1;
}
function confirmReceived() public payable  {
      require(msg.sender == buyer, "Only buyer can call this.");
require(state == 1, "Invalid state.");
emit item_received();
state = 2;
buyer.transfer(sell_value);
seller.transfer(address(this).balance);
}
}