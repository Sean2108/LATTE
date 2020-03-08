// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Web3 from 'web3';
import InitialStateTab from './InitialStateTab';
import Web3Utils from './build_utils/Web3Utils';
import DefaultBuildTab from './DefaultBuildTab';
import EditHistory from './build_utils/EditHistory';
import type {
  VariablesLookupType,
  BuildState,
  SettingsObj,
  VariableObj,
  RequireObj,
  onParseFn,
  StructLookupType,
  Classes
} from '../../types';

function TabContainer(props: { children: React.Node }): React.Node {
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

type Props = {
  classes: Classes,
  variables: VariablesLookupType,
  onTabsChange: ({}, ?({}) => void) => void,
  buildState: BuildState,
  settings: SettingsObj,
  connection: Web3,
  updateLoading: boolean => void
};

type State = {
  value: number,
  addTabPopoverAnchor: ?{},
  popoverContent: string
};

class BuildTabs extends React.Component<Props, State> {
  web3Utils: Web3Utils;

  editHistory: EditHistory;

  state = {
    value: 0,
    addTabPopoverAnchor: null,
    popoverContent: ''
  };

  componentWillMount() {
    const { buildState, connection, onTabsChange } = this.props;
    this.web3Utils = new Web3Utils(connection);
    this.editHistory = new EditHistory(buildState, onTabsChange);
  }

  handleChange = (event: {}, value: number): void => {
    this.setState({
      value
    });
  };

  handleOnChange = (
    newState: Array<VariableObj> | Array<RequireObj>,
    i: number,
    state: string
  ) => {
    const { buildState, onTabsChange } = this.props;
    const tabsState = [...buildState[state]];
    tabsState[i] = newState;
    onTabsChange({ [state]: tabsState });
  };

  handleChangeParams = (newState: Array<VariableObj>, i: number): void => {
    const { onTabsChange } = this.props;
    this.handleOnChange(newState, i, 'tabsParams');
    if (i === 0) {
      const newParams = newState.map(param => ({ ...param, value: '' }));
      onTabsChange({ constructorParams: newParams });
    }
  };

  onParse = (newState: onParseFn, i: number): void => {
    const { buildState, onTabsChange } = this.props;
    const parsedState = Object.entries(newState)
      .map(([key, value]) => {
        const newVal = [...buildState[key]];
        newVal[i] = value;
        return { [key]: newVal };
      })
      .reduce((result, current) => ({ ...result, ...current }), {});
    onTabsChange(parsedState, this.editHistory.addNode);
  };

  render(): React.Node {
    const {
      classes,
      variables,
      onTabsChange,
      buildState,
      settings,
      updateLoading
    } = this.props;
    const { value, addTabPopoverAnchor, popoverContent } = this.state;
    const updateBuildError = (buildError: string): void => {
      onTabsChange({ buildError });
    };

    return (
      <div className={classes.buildtabs}>
        <AppBar position="static" color="default">
          <Tabs
            className={classes.tabs}
            value={value}
            onChange={(event: {}, val: number): void => {
              if (val !== buildState.tabs.length) {
                this.handleChange(event, val);
              }
            }}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            {buildState.tabs.map((label: string) => (
              <Tab label={label} key={label} />
            ))}
            <Tab
              onClick={(event: SyntheticInputEvent<>) =>
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
              updateEntities={(entities: StructLookupType): void =>
                onTabsChange({ ...buildState, entities })
              }
              updateEvents={(events: StructLookupType): void =>
                onTabsChange({ ...buildState, events })
              }
              params={buildState.constructorParams}
              updateParams={(params: VariableObj): void => {
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
                  onParse={(newState: onParseFn): void =>
                    this.onParse(newState, i)
                  }
                  onChangeParams={(newParams: Array<VariableObj>): void =>
                    this.handleChangeParams(newParams, i)
                  }
                  onChangeRequire={(newRequire: Array<RequireObj>): void =>
                    this.handleOnChange(newRequire, i, 'tabsRequire')
                  }
                  onVariablesChange={(
                    newVariables: VariablesLookupType
                  ): void => onTabsChange({ variables: newVariables })}
                  params={buildState.tabsParams[i]}
                  requires={buildState.tabsRequire[i]}
                  diagram={buildState.diagrams[i]}
                  settings={settings}
                  gasHistory={buildState.gasHistory}
                  updateGasHistory={(): void => {
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
                  editHistory={this.editHistory}
                  updateLoading={updateLoading}
                />
              </TabContainer>
            )
        )}
        <Popover
          id="simple-popper"
          open={Boolean(addTabPopoverAnchor)}
          anchorEl={addTabPopoverAnchor}
          onClose={(): void => this.setState({ addTabPopoverAnchor: null })}
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
              onChange={(event: SyntheticInputEvent<HTMLInputElement>) =>
                this.setState({ popoverContent: event.currentTarget.value })
              }
              value={popoverContent}
            />
            <Button
              variant="contained"
              color="primary"
              className={classes.button}
              onClick={(): void => {
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

export default withStyles(styles)(BuildTabs);
