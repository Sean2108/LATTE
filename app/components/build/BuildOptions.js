import React from 'react';
import PropTypes from 'prop-types';
import {
  withStyles
} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
});

class BuildOptions extends React.Component {

  web3 = this.props.connection;

  deploySmartContract = () => {
    this.web3.eth.getAccounts((err, accs) => {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }
      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      let accounts = accs;
      let account = accounts[0];
      this.web3.eth.defaultAccount = account;
      var foodSafeSource = "pragma solidity ^0.4.6; contract FoodSafe {    struct Location{        string Name;        uint LocationId;        uint PreviousLocationId;        uint Timestamp;        string Secret;    }        mapping(uint => Location) Trail;    uint8 TrailCount=0;    function AddNewLocation(uint LocationId, string Name, string Secret)   {        Location memory newLocation;        newLocation.Name = Name;        newLocation.LocationId= LocationId;        newLocation.Secret= Secret;        newLocation.Timestamp = now;        if(TrailCount!=0)        {            newLocation.PreviousLocationId= Trail[TrailCount].LocationId;        }        Trail[TrailCount] = newLocation;        TrailCount++;    }    function GetTrailCount() returns(uint8){        return TrailCount;    }    function GetLocation(uint8 TrailNo) returns (string,uint,uint,uint,string)    {        return (Trail[TrailNo].Name, Trail[TrailNo].LocationId, Trail[TrailNo].PreviousLocationId, Trail[TrailNo].Timestamp,Trail[TrailNo].Secret);    }}";
      this.web3.eth.compile.solidity(foodSafeSource, (error, foodSafeCompiled) => {
        console.log(error);
        console.log(foodSafeCompiled);
        let abi = foodSafeCompiled['<stdin>:FoodSafe'].info.abiDefinition;
        let contract = web3.eth.contract(foodSafeABI);
        let code = foodSafeCompiled['<stdin>:FoodSafe'].code;
        console.log(abi);
      });
    });
  }

  toLowerCamelCase(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
      return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
  }

  formCode() {
    let buildState = this.props.buildState;
    console.log(buildState.tabsReturn);
    let code = 'pragma solidity ^0.4.22;\ncontract Purchase {\n';
    for (const [name, type] of Object.entries(buildState.variables)) {
      code += `${type} public ${name};\n`;
    }
    for (let i = 0; i < buildState.tabsCode.length; i++) {
      let functionName = buildState.tabs[i + 1] === 'Initial State' ? 'constructor' : this.toLowerCamelCase(buildState.tabs[i + 1]);
      let returnCode = buildState.tabsReturn[i] ? `returns (${buildState.tabsReturn[i]})` : '';
      code += `${functionName}(${buildState.tabsParams[i].map(element => `${element.type} ${element.name}`).join(', ')}) public payable ${returnCode} {\n${buildState.tabsCode[i]}}\n`;
    }
    return code;
  }

  render() {
    const {
      classes,
      theme,
      onback,
      buildState
    } = this.props;
    return ( <
      div >
      <
      Button variant = "outlined"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        onback
      } >
      Back <
      /Button>

      <
      Button variant = "contained"
      color = "primary"
      className = {
        classes.button
      }
      onClick = {
        () => console.log(this.formCode())
        // this.deploySmartContract
      } >
      Build <
      /Button> <
      /div>

    );
  }
}

BuildOptions.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  onback: PropTypes.func.isRequired,
  connection: PropTypes.object.isRequired,
  buildState: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptions);
