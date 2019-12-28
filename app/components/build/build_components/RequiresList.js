import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';
import RequireRow from './RequireRow';
import BuildParser from '../parsers/BuildParser';

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
      header,
      vars,
      onChangeRequire,
      requires,
      tooltipText,
      entities
    } = this.props;

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
            showMessage
            updateRequire={val => {
              const variables = [...requires];
              variables[index] = val;
              onChangeRequire(variables);
            }}
            variables={vars}
            structList={entities}
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
  header: PropTypes.string.isRequired,
  vars: PropTypes.object.isRequired,
  onChangeRequire: PropTypes.func.isRequired,
  requires: PropTypes.array.isRequired,
  tooltipText: PropTypes.string.isRequired,
  entities: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(RequiresList);
