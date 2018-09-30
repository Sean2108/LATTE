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

  render() {
    const {
      classes,
      theme,
      onback
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
        this.deploySmartContract
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
  connection: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptions);
