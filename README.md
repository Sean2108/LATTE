# LATTE: Visual Smart Contract Builder

[![Build Status](https://travis-ci.com/Sean2108/LATTE.svg?token=FcLFkh211qmFY1Deqxzn&branch=master)](https://travis-ci.com/Sean2108/LATTE)[![codecov](https://codecov.io/gh/Sean2108/LATTE/branch/master/graph/badge.svg?token=jmB5atsZia)](https://codecov.io/gh/Sean2108/LATTE)

LATTE is a graphical user interface tool that makes it easy for both developers and non-developers to create and deploy smart contracts. It uses a drag and drop interface to simplify the task of creating smart contracts, and it helps users to compile and deploy smart contracts onto the blockchain.

Uses electron, react, solc and web3. Material-UI is used to style the application. Tested using Jest, Enzyme and Sinon.

LATTE will be presented at the ACM SIGMOD Conference 2020 as a demo paper.

![More on LATTE](poster.jpg)

![Demo](demo.gif)

## To run:
- yarn - installs all packages and dependencies
- yarn dev - runs the application in development mode (with the console available)
- yarn start - runs the application in production mode
- yarn test - runs tests and generates test coverage report
- yarn package - package application for current environment into the release directory
- yarn package-all - package application for Windows, Linux and MacOS into the release directory

Ganache-cli can be used to setup a local blockchain environment to test the application. Run: 'ganache-cli -l 80000000000' (or any sufficiently large gas limit) and enter localhost:8545 on the first page to connect to it.
