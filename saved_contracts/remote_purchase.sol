pragma solidity ^0.5.4;
contract Code {
uint private state;
address payable private buyer;
address payable private seller;
uint private sell_value;
event Aborted ();
event PurchaseConfirmed ();
event ItemReceived ();
constructor() public payable {
	require(2 * msg.value / 2 == msg.value, "Value has to be even.");
	seller = msg.sender;
	sell_value = msg.value / 2;
}
function abort() public payable {
	require(msg.sender == seller, "Only seller can call this.");
	require(state == 0, "Invalid state.");
	emit Aborted();
	state = 2;
	seller.transfer(address(this).balance);
}
function confirmPurchase() public payable {
	require(state == 0, "Invalid state.");
	require(msg.value == 2 * sell_value);
	emit PurchaseConfirmed();
	buyer = msg.sender;
	state = 1;
}
function confirmReceived() public payable {
	require(msg.sender == buyer, "Only buyer can call this.");
	require(state == 1, "Invalid state.");
	emit ItemReceived();
	state = 2;
	buyer.transfer(sell_value);
	seller.transfer(address(this).balance);
}
}