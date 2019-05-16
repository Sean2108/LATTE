pragma solidity ^0.5.4;
contract Code {
struct Voter {
uint8 weight;
bool voted;
address payable delegate;
bytes8 vote;
}
Voter private sender_details;
address payable private delegated_to;
Voter private delegate_details;
bytes8 private delegate_vote;
mapping(bytes8 => uint) vote_count;
Voter private voter;
uint private winning_vote_count;
bytes8 private winning_proposal_name;
address payable private chairperson;
mapping(address => Voter) voter_details;
constructor() public payable  {
      chairperson = msg.sender;
Voter memory chairperson_voter = Voter(1, false, address(uint160(0)), "");
voter_details[chairperson] = chairperson_voter;
}
function addProposal(bytes8 proposal) public payable  {
      require(msg.sender == chairperson, "Only chairperson can add a new proposal.");
vote_count[proposal] = 0;
}
function giveRightToVote(address payable target_voter) public payable  {
      require(msg.sender == chairperson, "Only chairperson can give right to vote.");
require(voter_details[target_voter].voted == false, "The voter already voted.");
require(voter_details[target_voter].weight == 0, "The voter already has a right to vote.");
voter_details[target_voter].weight = 1;
}
function vote(bytes8 proposal) public payable  {
      require(voter_details[msg.sender].weight != 0, "Has no right to vote.");
require(voter_details[msg.sender].voted == false, "Already voted.");
voter = voter_details[msg.sender];
voter.voted = true;
voter.vote = proposal;
vote_count[proposal] += voter.weight;
if (vote_count[proposal] > winning_vote_count) {
winning_vote_count = vote_count[proposal];
winning_proposal_name = proposal;
} 
}
function winningProposal() public view returns (bytes8) {
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