pragma solidity >=0.4.0 <0.6.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "./ref.sol";
import "./gen.sol";

contract test_open_auction {

    SimpleAuction ref;
    Code gen;

  function beforeAll() public {
    ref = new SimpleAuction(60, address(uint160(1)));
    gen = new Code(address(uint160(1)), 60);
    Assert.equal(ref.getBeneficiary(), gen.getBeneficiary(), "beneficiary different");
    Assert.equal(ref.getAuctionEnd(), gen.getAuctionEnd(), "auction end different");
  }

  function bid_noExistingBid_shouldChangeHighestBidder() public {
    ref.bid(address(uint160(2)), 5);
    gen.bid(address(uint160(2)), 5);
    Assert.equal(ref.getHighestBidder(), gen.getHighestBidder(), "highest bidder different");
    Assert.equal(ref.getHighestBid(), gen.getHighestBid(), "highest bid different");
  }

  function bid_lowerThanExistingBid_shouldNotChangeHighestBidder() public {
    Assert.equals(ref.call("bid", [address(uint160(3)), 4]), false, "function should fail");
    Assert.equals(gen.call("bid", [address(uint160(3)), 4]), false, "function should fail");
  }

  function bid_higherThanExistingBid_shouldOverwriteHighestBidder() public {
    ref.bid(address(uint160(4)), 6);
    gen.bid(address(uint160(4)), 6);
    Assert.equal(ref.getHighestBidder(), gen.getHighestBidder(), "highest bidder different");
    Assert.equal(ref.getHighestBid(), gen.getHighestBid(), "highest bid different");
    Assert.equal(ref.getPendingReturns(address(uint160(2))), gen.getPendingReturns(address(uint160(2))), "withdraw pending returns different");
  }

  function withdraw_shouldChangePendingReturnsToZero() public {
    Assert.equal(ref.withdraw(address(uint160(2))), gen.withdraw(address(uint160(2))), "withdraw failed");
    Assert.equal(ref.getPendingReturns(address(uint160(2))), gen.getPendingReturns(address(uint160(2))), "withdraw pending returns different");
  }
}