pragma solidity ^0.5.4;
contract Code {
struct Voter {
uint weight;
bool voted;
address payable delegate;
string vote;
}
Voter public sender_details;
address payable public delegated_to;
Voter public delegate_details;
string public delegate_vote;
mapping(string => uint) vote_count;
Voter public voter;
mapping(string => uint) voute_count;
uint public winning_vote_count;
string public winning_proposal_name;
address payable public chairperson;
Voter public chairperson_voter;
mapping(address => Voter) voter_details;
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
voute_count[proposal] += voter.weight;
if (vote_count[proposal] > winning_vote_count) {
winning_vote_count = vote_count[proposal];
winning_proposal_name = proposal;
} 
}
function winningProposal() public payable returns (string memory) {
      return winning_proposal_name;
}
function delegate(address payable to) public payable  {
      require(voter_details[msg.sender].voted == false, "You already voted.");
require(to != msg.sender, "Self-delegation is disallowed.");
sender_details = voter_details[msg.sender];
delegated_to = to;
while (voter_details[delegated_to].delegate != address(uint160(0))) {
delegated_to = voter_details[delegated_to].delegate;
}
sender_details.voted = true;
sender_details.delegate = delegated_to;
delegate_details = voter_details[delegated_to];
if (delegate_details.voted == true) {
delegate_vote = delegate_details.vote;
vote_count[delegate_vote] += sender_details.weight;
} else {
delegate_details.weight += sender_details.weight;
}
}
}