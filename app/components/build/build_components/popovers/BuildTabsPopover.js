// @flow

import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AddIcon from '@material-ui/icons/Add';
import { PopoverContainer } from '../../build_utils/ContainerUtils';
import type { Classes, BuildState } from '../../../../types';
import DefaultDataNodeModel from '../../diagram/diagram_node_declarations/DefaultDataNode/DefaultDataNodeModel';

const styles = theme => ({
  popover: {
    display: 'flex'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  button: {
    margin: 0
  }
});

type Props = {
  classes: Classes,
  buildState: BuildState,
  anchorEl: ?{},
  startNodes: Array<?DefaultDataNodeModel>,
  setAnchorEl: (?{}) => void,
  onTabsChange: ({}, ?({}) => void) => void,
  updateStartNodes: (Array<?DefaultDataNodeModel>) => void
};

type State = {
  popoverContent: string
};

class BuildTabsPopover extends React.Component<Props, State> {
  state = {
    popoverContent: ''
  };

  render() {
    const {
      classes,
      buildState,
      anchorEl,
      setAnchorEl,
      onTabsChange,
      startNodes,
      updateStartNodes
    } = this.props;

    const { popoverContent } = this.state;

    return (
      <PopoverContainer anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
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
                  popoverContent: ''
                });
                setAnchorEl(null);
                onTabsChange(newTabsState);
                updateStartNodes([...startNodes, null]);
              }
            }}
          >
            Add <AddIcon className={classes.rightIcon} />
          </Button>
        </div>
      </PopoverContainer>
    );
  }
}

export default withStyles(styles, {
  withTheme: true
})(BuildTabsPopover);
