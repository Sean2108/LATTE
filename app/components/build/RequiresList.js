import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import RequireRow from './RequireRow';
import { BuildParser } from './BuildParser';
import Tooltip from '@material-ui/core/Tooltip';

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

class RequiresList extends React.Component {
  buildParser = new BuildParser(null);

  render() {
    const {
      classes,
      theme,
      header,
      vars,
      onChangeRequire,
      requires,
      tooltipText
    } = this.props;
    this.buildParser.reset(this.props.vars, {});

    if (requires.length === 0) {
      requires.push({
        var1: '',
        displayVar1: '',
        comp: '==',
        var2: '',
        displayVar2: '',
        requireMessage: ''
      });
    }

    return (
      <Paper className={classes.paper}>
        <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
          <Typography variant="title" noWrap>
            {header}
          </Typography>
        </Tooltip>
        {requires.map((element, index) => (
          <RequireRow
            require={element}
            key={index}
            vars={vars}
            showMessage={true}
            updateRequire={val => {
              let variables = [...requires];
              variables[index] = val;
              onChangeRequire(variables);
            }}
            parseVariable={this.buildParser.parseVariable}
          />
        ))}
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() =>
            onChangeRequire([
              ...requires,
              {
                var1: '',
                displayVar1: '',
                comp: '==',
                var2: '',
                displayVar2: '',
                requireMessage: ''
              }
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

RequiresList.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  header: PropTypes.string.isRequired,
  vars: PropTypes.object.isRequired,
  onChangeRequire: PropTypes.func.isRequired,
  requires: PropTypes.array.isRequired,
  tooltipText: PropTypes.string.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(RequiresList);
