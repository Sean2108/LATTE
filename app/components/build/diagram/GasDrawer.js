import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
  VictoryZoomContainer
} from 'victory';

const styles = {
  drawerContainer: {
    width: 'auto',
    color: 'black',
    padding: '10%'
  }
};

class GasDrawer extends React.Component {
  render() {
    const { classes, history } = this.props;

    return (
      <div className={classes.drawerContainer}>
        <Typography variant="title">Gas Usage</Typography>
        <br />
        <Typography variant="subheading">
          Current gas usage: {history[history.length - 1] || 'None'}
        </Typography>
        <br />
        <Typography variant="subheading">Gas Usage History:</Typography>
        {history.length > 1 ? (
          <VictoryChart
            theme={VictoryTheme.material}
            containerComponent={
              <VictoryZoomContainer
                zoomDomain={{ x: [0, history.length - 1] }}
              />
            }
          >
            <VictoryLine
              style={{
                data: { stroke: '#c43a31' },
                parent: { border: '1px solid #ccc' }
              }}
              data={history.map((element, index) => ({
                x: index,
                y: element / 1000
              }))}
            />
            <VictoryAxis label="Step Number" style={{ axisLabel: { padding: 40 } }} />
            <VictoryAxis
              dependentAxis
              label="Gas usage (in thousands)"
              style={{ axisLabel: { padding: 40 } }}
            />
          </VictoryChart>
        ) : (
          'No history yet.'
        )}
      </div>
    );
  }
}

GasDrawer.propTypes = {
  classes: PropTypes.object.isRequired,
  history: PropTypes.array.isRequired
};

export default withStyles(styles)(GasDrawer);
