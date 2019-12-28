import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  formControl: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 150
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  }
});

class VariableRow extends React.Component {
  render() {
    const { classes, updateVariables, val, bitsMode } = this.props;
    return (
      <div>
        <FormControl className={classes.formControl}>
          <TextField
            label="Variable Name"
            className={classes.textField}
            value={val.displayName}
            onChange={event =>
              updateVariables({
                ...val,
                displayName: event.target.value,
                name: event.target.value
                  .toLowerCase()
                  .trim()
                  .replace(/\s/g, '_')
              })
            }
          />
        </FormControl>

        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="protocol"> Variable Type </InputLabel>
          <Select
            value={val.type}
            onChange={event =>
              updateVariables({ ...val, type: event.target.value, bits: '' })
            }
            inputProps={{
              name: 'Var Type',
              id: 'type'
            }}
          >
            <MenuItem value="uint"> Number </MenuItem>
            <MenuItem value="bool"> True/False </MenuItem>
            <MenuItem value="address payable"> Address </MenuItem>
            <MenuItem value="string"> Text </MenuItem>
          </Select>
        </FormControl>

        {bitsMode &&
          val.type === 'uint' && (
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="protocol"> Number of Bits </InputLabel>
              <Select
                value={val.bits || ""}
                onChange={event =>
                  updateVariables({ ...val, bits: event.target.value })
                }
                inputProps={{
                  name: 'Number of Bits',
                  id: 'type'
                }}
              >
                <MenuItem value=""> None </MenuItem>
                <MenuItem value="8"> 8 </MenuItem>
                <MenuItem value="32"> 32 </MenuItem>
                <MenuItem value="64"> 64 </MenuItem>
                <MenuItem value="128"> 128 </MenuItem>
                <MenuItem value="256"> 256 </MenuItem>
              </Select>
            </FormControl>
          )}

        {bitsMode &&
          val.type === 'string' && (
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="protocol"> Number of Bytes </InputLabel>
              <Select
                value={val.bits || ""}
                onChange={event =>
                  updateVariables({ ...val, bits: event.target.value })
                }
                inputProps={{
                  name: 'Number of Bytes',
                  id: 'type'
                }}
              >
                <MenuItem value=""> None </MenuItem>
                <MenuItem value="4"> 4 </MenuItem>
                <MenuItem value="8"> 8 </MenuItem>
                <MenuItem value="16"> 16 </MenuItem>
                <MenuItem value="32"> 32 </MenuItem>
              </Select>
            </FormControl>
          )}
      </div>
    );
  }
}

VariableRow.propTypes = {
  classes: PropTypes.object.isRequired,
  updateVariables: PropTypes.func.isRequired,
  val: PropTypes.object.isRequired,
  bitsMode: PropTypes.bool.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(VariableRow);
