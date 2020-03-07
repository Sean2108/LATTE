import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import VariableList from './VariableList';
import type { StructLookupType, VariableObj, Classes } from '../../../types';

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

type Props = {
  classes: Classes,
  header: 'Events' | 'Entities',
  updateVariables: (StructLookupType) => void,
  initialVars: StructLookupType,
  tooltipText: string,
  varListTooltipText: string,
  bitsMode: boolean
};

type State = {
  contents: string
};

class StructList extends React.Component<Props, State> {
  state = {
    contents: ''
  };

  handleChange = (name: string) => (
    event: SyntheticInputEvent<HTMLInputElement>
  ): void => {
    this.setState({ [name]: event.currentTarget.value });
  };

  render(): React.Node {
    const {
      classes,
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
          {Object.keys(initialVars).map((key: string): React.Node => (
            <Grid item xs={6} key={key}>
              <VariableList
                header={key}
                updateVariables={(vars: Array<VariableObj>): void =>
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
            id="name-input"
            label={header === 'Entities' ? 'Entity Name' : 'Event Name'}
            className={classes.textField}
            onChange={this.handleChange('contents')}
            value={this.state.contents}
            margin="normal"
          />
          <Button
            id="add-struct-button"
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={(): void => {
              const contents: string = this.state.contents
                .replace(/(?:^\w|[A-Z]|\b\w)/g, letter => letter.toUpperCase())
                .replace(/\s+/g, '');
              if (!contents || contents in initialVars) return;
              updateVariables({
                ...initialVars,
                [contents]: []
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

export default withStyles(styles, {
  withTheme: true
})(StructList);
