pragma solidity >=0.4.0 <0.6.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "./ref.sol";
import "./gen.sol";

contract test_open_auction {

    Purchase ref;
    Code gen;

  function beforeAll() public {
    Assert.equal(ref.call("constructor", [address(uint160(1)), 5]), false, "function did not fail");
    Assert.equal(gen.call("constructor", [address(uint160(1)), 5]), false, "function did not fail");
    ref = new Purchase(address(uint160(1)), 6);
    gen = new Code(address(uint160(1)), 6);
    Assert.equal(ref.getSeller(), gen.getSeller(), "seller is different");
    Assert.equal(ref.getValue(), gen.getValue(), "value is different");
  }

  function abort_calledByNotSeller_shouldFail() public {
    Assert.equal(ref.call("abort", [address(uint160(2))]), false, "function did not fail");
    Assert.equal(gen.call("abort", [address(uint160(2))]), false, "function did not fail");
  }

  function abort_calledBySender_stateShouldBeInactive() public {
    ref.abort(address(uint160(1)));
    gen.abort(address(uint160(1)));
    Assert.equal(ref.getState(), ref.State.Locked, "state is not locked");
    Assert.equal(gen.getState(), 2, "state is not locked");
  }

  function confirmPurchase_calledAfterAborted_shouldFail() public {
    Assert.equal(ref.call("confirmPurchase", [address(uint160(2)), 6]), false, "function did not fail");
    Assert.equal(gen.call("confirmPurchase", [address(uint160(2)), 6]), false, "function did not fail");
    ref.setState(ref.State.Created);
    gen.setState(0);
  }
  
  function confirmPurchase_sendWrongAmount_shouldFail() public {
    Assert.equal(ref.call("confirmPurchase", [address(uint160(2)), 5]), false, "function did not fail");
    Assert.equal(gen.call("confirmPurchase", [address(uint160(2)), 5]), false, "function did not fail");
  }

  function confirmPurchase_correctAmount_stateShouldBeLockedAndBuyerSet() public {
    ref.confirmPurchase(address(uint160(2)), 6);
    gen.confirmPurchase(address(uint160(2)), 6);
    Assert.equal(ref.getState(), ref.State.Locked, "state is not locked");
    Assert.equal(gen.getState(), 2, "state is not locked");
    Assert.equal(ref.getBuyer(), gen.getBuyer(), "buyer is different");
  }

  function confirmReceived_NotBuyerCall_shouldFail() public {
    Assert.equal(ref.call("confirmReceived", [address(uint160(1))]), false, "function did not fail");
    Assert.equal(gen.call("confirmReceived", [address(uint160(1))]), false, "function did not fail");
  }
  
  function confirmReceived_buyerCall_stateShouldBeInactive() public {
    ref.confirmReceived(address(uint160(2)));
    gen.confirmReceived(address(uint160(2)));
    Assert.equal(ref.getState(), ref.State.Locked, "state is not locked");
  }
}