// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton } from '@material-ui/core';
import type { Classes } from '../../../types';

const styles = {
  tooltipFont: {
    fontSize: 14
  },
  inlineBlock: {
    display: 'inline-block'
  }
};

type Props = {
  classes: Classes,
  tooltipText: string,
  onClick: () => void,
  disabled: boolean,
  children: React.Node
};

class UndoRedoButton extends React.Component<Props> {
  render(): React.Node {
    const { classes, tooltipText, onClick, disabled, children } = this.props;
    return (
      <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
        <div className={classes.inlineBlock}>
          <IconButton
            onClick={onClick}
            aria-label={tooltipText}
            color="primary"
            disabled={disabled}
          >
            {children}
          </IconButton>
        </div>
      </Tooltip>
    );
  }
}

export default withStyles(styles)(UndoRedoButton);
