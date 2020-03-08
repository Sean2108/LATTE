// @flow

import * as React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';
import Button from '@material-ui/core/Button';
import { red } from '@material-ui/core/colors';
import Tooltip from '@material-ui/core/Tooltip';
import type { Classes } from '../../../types';

const styles = theme => ({
  wrapper: {
    margin: theme.spacing.unit,
    position: 'relative',
    display: 'inline-block'
  },
  buttonSuccess: {
    backgroundColor: green[500],
    '&:hover': {
      backgroundColor: green[700]
    }
  },
  buttonFailure: {
    backgroundColor: red[500],
    '&:hover': {
      backgroundColor: red[700]
    }
  },
  buttonProgress: {
    color: green[500],
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12
  },
  tooltipFont: {
    fontSize: 14
  }
});
type Props = {
  classes: Classes,
  loading: boolean,
  success: boolean,
  onClick: () => void,
  children: string,
  tooltipText: string
};

class AsyncStatusButton extends React.Component<Props> {
  render(): React.Node {
    const { classes, loading, success, onClick, tooltipText } = this.props;
    const buttonClassname: string = classNames({
      [classes.buttonSuccess]: success,
      [classes.buttonFailure]: !success
    });

    return (
      <div className={classes.wrapper}>
        <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
          <div>
            <Button
              variant="contained"
              color="primary"
              className={buttonClassname}
              disabled={loading}
              onClick={onClick}
            >
              {this.props.children}
            </Button>
          </div>
        </Tooltip>
        {loading && (
          <CircularProgress size={24} className={classes.buttonProgress} />
        )}
      </div>
    );
  }
}

export default withStyles(styles)(AsyncStatusButton);
