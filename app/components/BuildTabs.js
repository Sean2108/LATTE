import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import GlobalStateTab from './GlobalStateTab';
import BuildDiagram from './BuildDiagram';
import RequiresList from './RequiresList';

function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

const styles = theme => ({
  tabs: {
    flexGrow: 1,
    width: '97%',
    backgroundColor: theme.palette.background.paper,
  },
});

class BuildTabs extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;

    return (
      <div className={classes.tabs}>
        <AppBar position="static" color="default">
          <Tabs
            value={value}
            onChange={this.handleChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="auto"
          >
            <Tab label="Global State" />
            <Tab label="Constructor Logic" />
            <Tab label="Delegate" />
            <Tab label="Vote" />
            <Tab label="Winning Proposal" />
            <Tab label="Winner Name" />
            <Tab label="+" />
          </Tabs>
        </AppBar>
        {value === 0 && 
        <TabContainer>
            <GlobalStateTab/>
        </TabContainer>}
        {value === 1 && <TabContainer>
            <RequiresList header={"Checking Phase"} vars={["var1", "var2"]}/>
            <br/>
            <BuildDiagram/>
        </TabContainer>}
        {value === 2 && <TabContainer>delegate</TabContainer>}
        {value === 3 && <TabContainer>vote</TabContainer>}
        {value === 4 && <TabContainer>winningProposal</TabContainer>}
        {value === 5 && <TabContainer>winnerName</TabContainer>}
        {value === 6 && <TabContainer>+</TabContainer>}
      </div>
    );
  }
}

BuildTabs.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(BuildTabs);