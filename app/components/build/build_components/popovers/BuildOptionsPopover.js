import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { PopoverContainer } from '../../build_utils/ContainerUtils';

const styles = theme => ({
  button: {
    margin: 0
  },
  formControl: {
    margin: 0,
    minWidth: 200
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200
  },
  optionspopover: {
    display: 'flex'
  }
});

class BuildOptionsPopover extends React.Component {
  render() {
    const {
      classes,
      anchorEl,
      dataOp,
      fileName,
      files,
      handleChange,
      handleClose,
      saveData,
      loadData,
      saveContract,
      DATA_OP
    } = this.props;

    return (
      <PopoverContainer anchorEl={anchorEl} onClose={handleClose}>
        <div className={classes.optionspopover}>
          {dataOp === DATA_OP.SAVE_DATA || dataOp === DATA_OP.SAVE_CONTRACT ? (
            <TextField
              id="standard-name"
              label="File Name"
              className={classes.textField}
              value={fileName}
              onChange={handleChange('fileName')}
            />
          ) : (
            <FormControl className={classes.formControl}>
              <InputLabel htmlFor="filename-simple">File Name</InputLabel>
              <Select
                value={fileName}
                onChange={handleChange('fileName')}
                inputProps={{
                  name: 'filename',
                  id: 'filename-simple'
                }}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {files.map(item => (
                  <MenuItem value={item} key={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            onClick={() => {
              switch (dataOp) {
                case DATA_OP.SAVE_DATA:
                  saveData();
                  break;
                case DATA_OP.SAVE_CONTRACT:
                  saveContract();
                  break;
                case DATA_OP.LOAD_DATA:
                default:
                  loadData();
                  break;
              }
            }}
          >
            Done
          </Button>
        </div>
      </PopoverContainer>
    );
  }
}

BuildOptionsPopover.propTypes = {
  classes: PropTypes.object.isRequired,
  anchorEl: PropTypes.object,
  dataOp: PropTypes.number.isRequired,
  fileName: PropTypes.string.isRequired,
  files: PropTypes.array.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  saveData: PropTypes.func.isRequired,
  loadData: PropTypes.func.isRequired,
  saveContract: PropTypes.func.isRequired,
  DATA_OP: PropTypes.object.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(BuildOptionsPopover);
