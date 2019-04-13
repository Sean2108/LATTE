pragma solidity >=0.4.22 <0.6.0;

contract Ballot {
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        address delegate; // person delegated to
        bytes32 vote;   // name of the voted proposal
    }

    address public chairperson;
    uint winningVoteCount;
    bytes32 winningProposalName;

    mapping(address => Voter) public voters;
    mapping(bytes32 => uint) public proposals;

    constructor() public {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;
    }

    function addProposal(bytes32 proposalName) public {
        require(
            msg.sender == chairperson,
            "Only chairperson can add a new proposal."
        );
        proposals[proposalName] = 0;
    }

    function giveRightToVote(address voter) public {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            !voters[voter].voted,
            "The voter already voted."
        );
        require(
            voters[voter].weight == 0, 
            "The voter already has a right to vote."
        );
        voters[voter].weight = 1;
    }

    function vote(bytes32 proposal) public {
        Voter storage sender = voters[msg.sender];
        require(sender.weight != 0, "Has no right to vote.");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = proposal;

        proposals[proposal] += sender.weight;
        if (proposals[proposal] > winningVoteCount) {
            winningVoteCount = proposals[proposal];
            winningProposalName = proposal;
        }
    }

    function winningProposal() public view
            returns (bytes32)
    {
        return winningProposalName;
    }

    function delegate(address to) public {
        Voter storage sender = voters[msg.sender];
        require(!sender.voted, "You already voted.");

        require(to != msg.sender, "Self-delegation is disallowed.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;
        }
        sender.voted = true;
        sender.delegate = to;
        Voter storage delegate_ = voters[to];
        if (delegate_.voted) {
            proposals[delegate_.vote] += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
}