import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const styles = {
  drawerContainer: {
    width: 'auto',
    color: 'black',
    padding: '0 20% 0 20%'
  }
};

class GasDrawer extends React.Component {
  render() {
    const { classes } = this.props;

    return (
      <div className={classes.drawerContainer}>
        <Typography variant="title" noWrap>
          Action Phase
        </Typography>
      </div>
    );
  }
}

GasDrawer.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(GasDrawer);
