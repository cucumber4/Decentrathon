// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IToken {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract Voting {
    struct Poll {
        string name;
        string[] candidates;
        mapping(string => uint256) votes;
        mapping(address => bool) hasVoted;
        bool active;
    }

    mapping(uint256 => Poll) public polls;
    uint256 public pollCount;
    address public tokenAddress;
    uint256 public voteCost = 10 * 10**18;
    event PollCreated(uint256 pollId, string name);
    event PollOpened(uint256 pollId);
    event PollClosed(uint256 pollId);
    event Voted(uint256 pollId, string candidate, address voter);

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
    }


    function createPoll(string memory _name, string[] memory _candidates) public {
        require(_candidates.length >= 2 && _candidates.length <= 8, "Must have 2 to 8 candidates");

        Poll storage newPoll = polls[pollCount];
        newPoll.name = _name;
        newPoll.candidates = _candidates;
        newPoll.active = false;

        emit PollCreated(pollCount, _name);
        pollCount++;
    }


    function openPoll(uint256 pollId) public {
        require(pollId < pollCount, "Poll does not exist");
        polls[pollId].active = true;
        emit PollOpened(pollId);
    }


    function closePoll(uint256 pollId) public {
        require(pollId < pollCount, "Poll does not exist");
        polls[pollId].active = false;
        emit PollClosed(pollId);
    }


    function hasUserVoted(uint256 pollId, address user) public view returns (bool) {
        require(pollId < pollCount, "Poll does not exist");
        return polls[pollId].hasVoted[user];
    }


    function vote(uint256 pollId, string memory candidate) public {
        require(pollId < pollCount, "Poll does not exist");
        Poll storage poll = polls[pollId];
        require(poll.active, "Poll closed");
        require(!poll.hasVoted[msg.sender], "Already voted");


        IToken token = IToken(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), voteCost), "Token transfer failed");

        poll.votes[candidate]++;
        poll.hasVoted[msg.sender] = true;

        emit Voted(pollId, candidate, msg.sender);
    }


    function getResult(uint256 pollId, string memory candidate) public view returns (uint256) {
        require(pollId < pollCount, "Poll does not exist");
        return polls[pollId].votes[candidate];
    }


    function getPollCount() public view returns (uint256) {
        return pollCount;
    }


    function getPoll(uint256 pollId) public view returns (string memory, bool) {
        require(pollId < pollCount, "Poll does not exist");
        return (polls[pollId].name, polls[pollId].active);
    }
}
