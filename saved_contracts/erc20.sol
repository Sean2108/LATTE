pragma solidity ^0.5.4;
contract Code {
mapping(address => mapping(address => uint)) _allowed;
mapping(address => uint) _balances;
event Transferred(address payable from, address payable to, uint amount);
event Approval(address payable owner, address payable spender, uint amount);
constructor() public payable  {
      }
function transfer(address payable to, uint amount) public payable  {
      require(to != address(uint160(0)), "");
}
function approve(address payable spender, uint amount) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = amount;
emit Approval(msg.sender, spender, amount);
return true;
}
function transferFrom(address payable from, address payable to, uint amount) public payable returns (bool) {
      require(from != address(uint160(0)), "");
require(to != address(uint160(0)), "");
_balances[from] -= amount;
_balances[to] += amount;
emit Transferred(from, to, amount);
_allowed[from][msg.sender] -= amount;
emit Approval(from, msg.sender, amount);
return true;
}
function increaseAllowance(address payable spender, uint added_value) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] += added_value;
emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
return true;
}
function decreaseAllowance(address payable spender, uint subtracted_value) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] -= subtracted_value;
emit Approval(msg.sender, spender, _allowed[msg.sender][spender]);
return true;
}
}