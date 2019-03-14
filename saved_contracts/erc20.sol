pragma solidity ^0.5.4;
contract Code {
mapping(address => mapping(address => uint)) _allowed;
mapping(address => uint) _balances;
constructor() public payable  {
      }
function transfer(address payable to, uint amount) public payable returns (bool) {
      require(to != address(uint160(0)), "");
_balances[msg.sender] = _balances[msg.sender] - amount;
_balances[to] = _balances[to] + amount;
return true;
}
function approve(address payable spender, uint amount) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = amount;
return true;
}
function transferFrom(address payable from, address payable to, uint amount) public payable returns (bool) {
      require(from != address(uint160(0)), "");
require(to != address(uint160(0)), "");
_balances[from] = _balances[from] - amount;
_balances[to] = _balances[to] + amount;
_allowed[from][to] = amount;
return true;
}
function increaseAllowance(address payable spender, uint added_value) public payable  {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = _allowed[msg.sender][spender] + added_value;
}
function decreaseAllowance(address payable spender, uint subtracted_value) public payable  {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = _allowed[msg.sender][spender] - subtracted_value;
}
}