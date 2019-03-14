pragma solidity ^0.5.4;
contract Code {
mapping(address => mapping(address => uint)) _allowed;
mapping(address => uint) _balances;
event transferred(address payable from, address payable to, uint amount);
event approval(address payable owner, address payable spender, uint amount);
constructor() public payable  {
      }
function transfer(address payable to, uint amount) public payable returns (bool) {
      require(to != address(uint160(0)), "");
_balances[msg.sender] = _balances[msg.sender] - amount;
_balances[to] = _balances[to] + amount;
emit transferred(msg.sender, to, amount);
return true;
}
function approve(address payable spender, uint amount) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = amount;
emit approval(msg.sender, spender, amount);
return true;
}
function transferFrom(address payable from, address payable to, uint amount) public payable returns (bool) {
      require(from != address(uint160(0)), "");
require(to != address(uint160(0)), "");
_balances[from] = _balances[from] - amount;
_balances[to] = _balances[to] + amount;
emit transferred(from, to, amount);
_allowed[from][msg.sender] = _allowed[from][msg.sender] - amount;
emit approval(from, msg.sender, amount);
return true;
}
function increaseAllowance(address payable spender, uint added_value) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = _allowed[msg.sender][spender] + added_value;
emit approval(msg.sender, spender, added_value);
return true;
}
function decreaseAllowance(address payable spender, uint subtracted_value) public payable returns (bool) {
      require(spender != address(uint160(0)), "");
require(msg.sender != address(uint160(0)), "");
_allowed[msg.sender][spender] = _allowed[msg.sender][spender] - subtracted_value;
emit approval(msg.sender, spender, subtracted_value);
return true;
}
}