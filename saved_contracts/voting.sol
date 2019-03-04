pragma solidity ^0.5.4;
contract Code {
struct Voter {
uint weight;
bool voted;
address payable delegate;
string vote;
}
mapping(string => uint) vote_count;
address payable public chairperson;
Voter public chairperson_voter;
mapping(address => Voter) voter_details;
Voter public voter;
uint public winning_vote_count;
string public winning_proposal_name;
constructor() public payable  {
      chairperson = msg.sender;
chairperson_voter = Voter(1, false, address(uint160(0)), "");
voter_details[chairperson] = chairperson_voter;
}
function addProposal(string memory proposal) public payable  {
      require(msg.sender == chairperson, "Only chairperson can add a new proposal.");
vote_count[proposal] = 0;
}
function giveRightToVote(address payable target_voter) public payable  {
      require(msg.sender == chairperson, "Only chairperson can give right to vote.");
require(voter_details[target_voter].voted == false, "The voter already voted.");
require(voter_details[target_voter].weight == 0, "The voter already has a right to vote.");
voter_details[target_voter].weight = 1;
}
function vote(string memory proposal) public payable  {
      require(voter_details[msg.sender].weight != 0, "Has no right to vote.");
require(voter_details[msg.sender].voted == false, "Already voted.");
voter = voter_details[msg.sender];
voter.voted = true;
voter.vote = proposal;
vote_count[proposal] = vote_count[proposal] + voter.weight;
if (vote_count[proposal] > winning_vote_count) {
winning_vote_count = vote_count[proposal];
winning_proposal_name = proposal;
} 
}
function winningProposal() public payable returns (string memory) {
      return winning_proposal_name;
}
}