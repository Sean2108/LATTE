import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { VictoryChart, VictoryLine, VictoryTheme } from 'victory';

const styles = {
  drawerContainer: {
    width: 'auto',
    color: 'black',
    padding: '0 20% 0 20%'
  },
  chart: {
    width: 1000,
    height: 1000
  }
};

class GasDrawer extends React.Component {
  render() {
    const { classes, history } = this.props;

    return (
      <div className={classes.drawerContainer}>
        <Typography variant="subheading">
          Current gas usage: {history[history.length - 1] || 'None'}
        </Typography>
        <Typography variant="title">
          Gas Usage History:
        </Typography>
        {history.length > 0 ? <VictoryChart className={classes.chart} theme={VictoryTheme.material}>
          <VictoryLine
            style={{
              data: { stroke: '#c43a31' },
              parent: { border: '1px solid #ccc' }
            }}
            data={[{ x: 0, y: 0 }].concat(
              history.map((element, index) => {
                return { x: index + 1, y: element };
              })
            )}
          />
        </VictoryChart> : 'No history yet.'}
      </div>
    );
  }
}

GasDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.array.isRequired
};

export default withStyles(styles)(GasDrawer);
