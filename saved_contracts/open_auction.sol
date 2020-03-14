pragma solidity ^0.5.4;
contract Code {
bool private ended;
uint private amount;
mapping(address => uint) pending_returns;
address payable private highest_bidder;
uint private highest_bid;
address payable private beneficiary;
uint private auction_end;
event HighestBidIncreased (address payable bidder, uint amount);
event AuctionEnded (address payable winner, uint amount);
constructor(address payable _beneficiary, uint bidding_time) public payable {
	beneficiary = _beneficiary;
	auction_end = now + bidding_time;
}
function bid() public payable {
	require(now <= auction_end, "Auction already ended.");
	require(msg.value > highest_bid, "There already is a higher bid.");
	if (highest_bid != 0) {
		pending_returns[highest_bidder] += highest_bid;
	} else {
		highest_bidder = msg.sender;
		highest_bid = msg.value;
		emit HighestBidIncreased(msg.sender, msg.value);
	}
}
function withdraw() public payable {
	amount = pending_returns[msg.sender];
	if (amount > 0) {
		pending_returns[msg.sender] = 0;
		msg.sender.transfer(amount);
	}
}
function auctionEnd() public payable {
	require(now >= auction_end, "Auction not yet ended.");
	require(ended == false, "auctionEnd has already been called.");
	ended = true;
	emit AuctionEnded(highest_bidder, highest_bid);
	beneficiary.transfer(highest_bid);
}
}