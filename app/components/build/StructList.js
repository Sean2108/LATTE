import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import VariableList from './VariableList';
import Tooltip from '@material-ui/core/Tooltip';

const styles = theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '40vw',
    overflow: 'auto'
  },
  button: {
    margin: 0,
    marginTop: '2%',
    height: '50%'
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  tooltipFont: {
    fontSize: 14
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

class StructList extends React.Component {
  state = {
    contents: '',
    propcontents: '',
    modalAdd: '',
    anchor: null
  };

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  render() {
    const {
      classes,
      theme,
      header,
      updateVariables,
      initialVars,
      tooltipText,
      varListTooltipText,
      bitsMode
    } = this.props;
    return (
      <Paper className={classes.paper}>
        <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
          <Typography variant="title" noWrap>
            {header}
          </Typography>
        </Tooltip>
        <br />
        <Grid container spacing={24}>
          {Object.keys(initialVars).map(key => (
            <Grid item xs={6} key={key}>
              <VariableList
                header={key}
                updateVariables={vars =>
                  updateVariables({ ...initialVars, [key]: vars })
                }
                vars={initialVars[key]}
                tooltipText={varListTooltipText}
                bitsMode={bitsMode}
              />
            </Grid>
          ))}
        </Grid>
        <div className={classes.row}>
        <TextField
          id="standard-name"
          label={header === 'Entities' ? 'Entity Name' : 'Event Name'}
          className={classes.textField}
          onChange={this.handleChange('contents')}
          value={this.state.contents}
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => {
            if (!this.state.contents || this.state.contents in initialVars)
              return;
            updateVariables({
              ...initialVars,
              [this.state.contents
                .replace(/(?:^\w|[A-Z]|\b\w)/g, letter => letter.toUpperCase())
                .replace(/\s+/g, '')]: []
            });
            this.setState({ contents: '' });
          }}
        >
          Add <AddIcon className={classes.rightIcon} />
        </Button>
        </div>
        <br />
      </Paper>
    );
  }
}

StructList.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  header: PropTypes.string.isRequired,
  updateVariables: PropTypes.func,
  initialVars: PropTypes.object.isRequired,
  tooltipText: PropTypes.string.isRequired,
  varListTooltipText: PropTypes.string.isRequired,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(StructList);
