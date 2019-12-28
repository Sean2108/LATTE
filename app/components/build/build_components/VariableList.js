import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import VariableRow from './VariableRow';

const styles = theme => ({
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '40vw',
    overflow: 'auto'
  },
  button: {
    margin: theme.spacing.unit
  },
  tooltipFont: {
    fontSize: 14
  }
});

class VariableList extends React.Component {
  render() {
    const { classes, header, updateVariables, vars, tooltipText, bitsMode } = this.props;

    if (vars.length === 0) {
      vars.push({ name: '', displayName: '', type: 'uint', bits: '' });
    }

    return (
      <Paper className={classes.paper}>
      <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
        <Typography variant="title" noWrap>
          {header}
        </Typography>
      </Tooltip>
        {vars.map((element, index) => (
          <VariableRow
            val={element}
            key={index}
            updateVariables={val => {
              const variables = [...vars];
              variables[index] = val;
              updateVariables(variables);
            }}
            bitsMode={bitsMode}
          />
        ))}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() =>
            updateVariables([
              ...vars,
              { name: '', displayName: '', type: 'uint', bits: '' }
            ])
          }
        >
          +
        </Button>
        <br />
      </Paper>
    );
  }
}

VariableList.propTypes = {
  classes: PropTypes.object.isRequired,
  header: PropTypes.string.isRequired,
  updateVariables: PropTypes.func.isRequired,
  vars: PropTypes.array.isRequired,
  tooltipText: PropTypes.string.isRequired,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(VariableList);
