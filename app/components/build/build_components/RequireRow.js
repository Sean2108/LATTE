// @flow

import * as React from 'react';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import parseVariable from '../parsers/VariableParser';
import type { RequireObj,VariablesLookupType, StructLookupType, Classes } from '../../../types';

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 250
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
});

type Props = {
  classes: Classes,
  showMessage: boolean,
  updateRequire: RequireObj => void,
  variables: VariablesLookupType,
  structList: StructLookupType,
  require: RequireObj
};

class RequireRow extends React.Component<Props> {
  handleChange = (name: string) => (
    event: SyntheticInputEvent<>
  ) => {
    const { require, variables, structList, updateRequire } = this.props;
    const state: RequireObj = { ...require, [name]: event.target.value };
    try {
      if (variables && structList) {
        state.var1 = parseVariable(
          state.displayVar1,
          variables,
          structList
        ).name;
        state.var2 = parseVariable(
          state.displayVar2,
          variables,
          structList
        ).name;
      }
    } catch (err) {
      console.log(err);
    }
    updateRequire(state);
  };

  render(): React.Node {
    const { classes, showMessage, require } = this.props;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            id="standard-name"
            label="Variable 1"
            multiline
            rowsMax="3"
            className={classes.textField}
            value={require.displayVar1}
            onChange={this.handleChange('displayVar1')}
            margin="none"
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="protocol"> Comparator </InputLabel>
          <Select
            value={require.comp}
            onChange={this.handleChange('comp')}
            inputProps={{
              name: 'Comparator',
              id: 'comp'
            }}
          >
            <MenuItem value="=="> is </MenuItem>
            <MenuItem value="!="> is not </MenuItem>
            <MenuItem value=">"> greater than </MenuItem>
            <MenuItem value="<"> less than </MenuItem>
            <MenuItem value=">="> greater than or equals to </MenuItem>
            <MenuItem value="<="> less than or equals to </MenuItem>
          </Select>
        </FormControl>

        <FormControl className={classes.formControl}>
          <TextField
            id="standard-name"
            label="Variable 2"
            multiline
            rowsMax="3"
            className={classes.textField}
            value={require.displayVar2}
            onChange={this.handleChange('displayVar2')}
            margin="none"
          />
        </FormControl>

        {showMessage && (
          <FormControl className={classes.formControl}>
            <TextField
              id="standard-name"
              label="Failure Message"
              multiline
              rowsMax="3"
              className={classes.textField}
              value={require.requireMessage}
              onChange={this.handleChange('requireMessage')}
              margin="none"
            />
          </FormControl>
        )}
      </div>
    );
  }
}

export default withStyles(styles, {
  withTheme: true
})(RequireRow);
