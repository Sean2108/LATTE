import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import InitialStateTab from './InitialStateTab';
import Web3Utils from './build_utils/Web3Utils';
import DefaultBuildTab from './DefaultBuildTab';

function TabContainer(props) {
  const { children } = props;
  return (
    <Typography
      component="div"
      style={{
        paddingTop: 24,
        paddingBottom: 24
      }}
    >
      {children}
    </Typography>
  );
}

TabContainer.propTypes = {
  children: PropTypes.node.isRequired
};

const styles = theme => ({
  buildtabs: {
    flexGrow: 1,
    width: '97%',
    backgroundColor: theme.palette.background.paper
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  button: {
    margin: 0
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  tabs: {
    width: '100%',
    maxWidth: '80vw'
  },
  popover: {
    display: 'flex'
  }
});

class BuildTabs extends React.Component {
  state = {
    value: 0,
    addTabPopoverAnchor: null,
    popoverContent: ''
  };

  componentWillMount() {
    const { connection } = this.props;
    this.web3Utils = new Web3Utils(connection);
  }

  handleChange = (event, value) => {
    this.setState({
      value
    });
  };

  handleOnChange = (newState, i, state) => {
    const { buildState, onTabsChange } = this.props;
    const tabsState = [...buildState[state]];
    tabsState[i] = newState;
    onTabsChange({ [state]: tabsState });
  };

  handleChangeParams = (newState, i) => {
    const { onTabsChange } = this.props;
    this.handleOnChange(newState, i, 'tabsParams');
    if (i === 0) {
      const newParams = newState.map(param => ({ ...param, value: '' }));
      onTabsChange({ constructorParams: newParams });
    }
  };

  render() {
    const {
      classes,
      variables,
      onTabsChange,
      buildState,
      settings
    } = this.props;
    const { value, addTabPopoverAnchor, popoverContent } = this.state;
    const updateBuildError = buildError => {
      onTabsChange({ buildError });
    };

    return (
      <div className={classes.buildtabs}>
        <AppBar position="static" color="default">
          <Tabs
            className={classes.tabs}
            value={value}
            onChange={(event, val) => {
              if (val !== buildState.tabs.length) {
                this.handleChange(event, val);
              }
            }}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {buildState.tabs.map(label => (
              <Tab label={label} key={label} />
            ))}
            <Tab
              onClick={event =>
                this.setState({ addTabPopoverAnchor: event.currentTarget })
              }
              label="+"
            />
          </Tabs>
        </AppBar>
        {value === 0 && (
          <TabContainer>
            <InitialStateTab
              entities={buildState.entities}
              events={buildState.events}
              updateEntities={entities =>
                onTabsChange({ ...buildState, entities })
              }
              updateEvents={events => onTabsChange({ ...buildState, events })}
              params={buildState.constructorParams}
              updateParams={params => {
                onTabsChange({
                  constructorParams: params
                });
              }}
              settings={settings}
            />
          </TabContainer>
        )}
        {[...Array(buildState.tabs.length - 1).keys()].map(
          i =>
            value === i + 1 && (
              <TabContainer key={i}>
                <DefaultBuildTab
                  varList={variables}
                  events={buildState.events}
                  entities={buildState.entities}
                  onChangeLogic={newCode =>
                    this.handleOnChange(newCode, i, 'tabsCode')
                  }
                  onChangeParams={newParams =>
                    this.handleChangeParams(newParams, i)
                  }
                  onChangeReturn={newReturn =>
                    this.handleOnChange(newReturn, i, 'tabsReturn')
                  }
                  onChangeRequire={newRequire =>
                    this.handleOnChange(newRequire, i, 'tabsRequire')
                  }
                  onVariablesChange={newVariables =>
                    onTabsChange({ variables: newVariables })
                  }
                  params={buildState.tabsParams[i]}
                  requires={buildState.tabsRequire[i]}
                  diagram={buildState.diagrams[i]}
                  onChangeView={newView =>
                    this.handleOnChange(newView, i, 'isView')
                  }
                  updateDiagram={diagram =>
                    this.handleOnChange(diagram, i, 'diagrams')
                  }
                  settings={settings}
                  gasHistory={buildState.gasHistory}
                  updateGasHistory={() => {
                    const history = buildState.gasHistory;
                    this.web3Utils.getGasUsage(
                      buildState,
                      settings,
                      history,
                      updateBuildError
                    );
                    onTabsChange({ gasHistory: history });
                  }}
                  updateBuildError={updateBuildError}
                  isConstructor={i === 0}
                />
              </TabContainer>
            )
        )}
        <Popover
          id="simple-popper"
          open={Boolean(addTabPopoverAnchor)}
          anchorEl={addTabPopoverAnchor}
          onClose={() => this.setState({ addTabPopoverAnchor: null })}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <div className={classes.popover}>
            <TextField
              id="standard-name"
              label="Function Name"
              className={classes.textField}
              onChange={event =>
                this.setState({ popoverContent: event.target.value })
              }
              value={popoverContent}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={() => {
                if (
                  this.state.popoverContent &&
                  !buildState.tabs
                    .map(tab => tab.toLowerCase())
                    .includes(this.state.popoverContent.toLowerCase())
                ) {
                  const newTabsState = {
                    tabs: [...buildState.tabs, this.state.popoverContent],
                    tabsCode: [...buildState.tabsCode, ''],
                    tabsParams: [...buildState.tabsParams, []],
                    tabsRequire: [...buildState.tabsRequire, []],
                    isView: [...buildState.isView, false],
                    diagrams: [...buildState.diagrams, {}]
                  };
                  this.setState({
                    popoverContent: '',
                    addTabPopoverAnchor: null
                  });
                  onTabsChange(newTabsState);
                }
              }}
            >
              Add <AddIcon className={classes.rightIcon} />
            </Button>
          </div>
        </Popover>
      </div>
    );
  }
}

BuildTabs.propTypes = {
  classes: PropTypes.object.isRequired,
  variables: PropTypes.object.isRequired,
  onTabsChange: PropTypes.func.isRequired,
  buildState: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  connection: PropTypes.object.isRequired
};

export default withStyles(styles)(BuildTabs);
