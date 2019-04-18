pragma solidity >=0.4.0 <0.6.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "./ref.sol";
import "./gen.sol";

contract test_voting {

    Ballot ref;
    Code gen;

  function beforeAll() public {
    ref = new Ballot(address(uint160(1)));
    gen = new Code(address(uint160(1)));
    Assert.equal(ref.getChairperson(), gen.getChairperson(), "chairperson is different");
    Assert.equal(ref.getVoter(address(uint160(1))).weight, gen.getVoter(address(uint160(1))).weight, "weight is different");
  }

  function addProposal_notCalledByChairperson_shouldFail() public {
    Assert.equal(ref.call("addProposal", [address(uint160(2)), "p1"]), false, "function did not fail");
    Assert.equal(gen.call("addProposal", [address(uint160(2)), "p1"]), false, "function did not fail");
  }

  function addProposal_addP1_p1ZeroVotes() public {
    ref.addProposal(address(uint160(1)), "p1");
    gen.addProposal(address(uint160(1)), "p1");
    Assert.equal(ref.getProposal("p1"), 0, "should have 0 votes");
    Assert.equal(gen.getProposal("p1"), 0, "should have 0 votes");
  }
  
  function addProposal_addP2_p1p2ZeroVotes() public {
    ref.addProposal(address(uint160(1)), "p2");
    gen.addProposal(address(uint160(1)), "p2");
    Assert.equal(ref.getProposal("p1"), 0, "should have 0 votes");
    Assert.equal(gen.getProposal("p1"), 0, "should have 0 votes");
    Assert.equal(ref.getProposal("p2"), 0, "should have 0 votes");
    Assert.equal(gen.getProposal("p2"), 0, "should have 0 votes");
  }

  function giveRightToVote_notCalledByChairperson_shouldFail() public {
    Assert.equal(ref.call("giveRightToVote", [address(uint160(2)), address(uint160(3))]), false, "function did not fail");
    Assert.equal(gen.call("giveRightToVote", [address(uint160(2)), address(uint160(3))]), false, "function did not fail");
  }

  function giveRightToVote_giveAddress2Right_address2WeightShouldBe1() public {
    ref.giveRightToVote(address(uint160(1)), address(uint160(2)));
    gen.giveRightToVote(address(uint160(1)), address(uint160(2)));
    Assert.equal(ref.getVoter(address(uint160(2))).weight, gen.getVoter(address(uint160(2))).weight, "weight is different");
  }

  function giveRightToVote_giveAddress2RightAgain_shouldFail() public {
    Assert.equal(ref.call("giveRightToVote", [address(uint160(1)), address(uint160(2))]), false, "function did not fail");
    Assert.equal(gen.call("giveRightToVote", [address(uint160(1)), address(uint160(2))]), false, "function did not fail");
  }

  function delegate_selfDelegate_shouldFail() {
    Assert.equal(ref.call("delegate", [address(uint160(2)), address(uint160(2))]), false, "function did not fail");
    Assert.equal(gen.call("delegate", [address(uint160(2)), address(uint160(2))]), false, "function did not fail");
  }

  function delegate_address2DelegateTo3_address2VotedAndAddress3Weight1() public {
    ref.delegate(address(uint160(2)), address(uint160(3)));
    gen.delegate(address(uint160(2)), address(uint160(3)));
    Assert.equal(ref.getVoter(address(uint160(2))).voted, gen.getVoter(address(uint160(2))).voted, "voted is different");
    Assert.equal(ref.getVoter(address(uint160(3))).weight, gen.getVoter(address(uint160(3))).weight, "weight is different");
  }

  function vote_address2Vote_shouldFail() public {
    Assert.equal(ref.call("vote", [address(uint160(2)), "p1"]), false, "function did not fail");
    Assert.equal(gen.call("vote", [address(uint160(2)), "p1"]), false, "function did not fail");
  }

  function vote_address3VoteP1_p1VotesShouldBe1() public {
    ref.vote(address(uint160(3)), "p1");
    gen.vote(address(uint160(3)), "p1");
    Assert.equal(ref.getProposal("p1"), ref.getProposal("p1"), "p1 votes is different");
  }
  
  function vote_address1VoteP1_p1VotesShouldBe2() public {
    ref.vote(address(uint160(1)), "p1");
    gen.vote(address(uint160(1)), "p1");
    Assert.equal(ref.getProposal("p1"), ref.getProposal("p1"), "p1 votes is different");
  }

  function winningProposal_shouldReturnP1() {
    Assert.equal(ref.winningProposal(), gen.winningProposal(), "winning proposal is different");
  }
}