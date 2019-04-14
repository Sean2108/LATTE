import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import Tooltip from '@material-ui/core/Tooltip';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

const styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 300
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    maxHeight: '20vw',
    overflow: 'auto'
  },
  tooltipFont: {
    fontSize: 14
  },
  formControl: {
    margin: theme.spacing.unit,
    width: 300
  }
});

class ParamList extends React.Component {
  handleChange = index => event => {
    let params = [...this.props.params];
    params[index].value = event.target.value;
    this.props.updateParams(params);
  };

  componentWillMount() {
    this.setState({ params: this.props.params });
  }

  render() {
    const {
      classes,
      theme,
      header,
      updateVariables,
      params,
      updateParams,
      tooltipText
    } = this.props;

    return (
      <Paper className={classes.paper}>
        <Tooltip title={tooltipText} classes={{ tooltip: classes.tooltipFont }}>
          <Typography variant="title" noWrap>
            {header}
          </Typography>
        </Tooltip>
        <br />
        {params.filter(param => param.name).map((param, index) => (
          <div key={index}>
            {param.type === 'bool' ? (
              <FormControl className={classes.formControl}>
                <InputLabel htmlFor="protocol">
                  {`Value of ${param.displayName || ''}`}
                </InputLabel>
                <Select
                  value={param.value || 'true'}
                  onChange={this.handleChange(index)}
                  inputProps={{
                    name: 'truefalse',
                    id: 'tf'
                  }}
                >
                  <MenuItem value="true"> True </MenuItem>
                  <MenuItem value="false"> False </MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField
                id="value"
                label={`Value of ${param.displayName || ''}`}
                className={classes.textField}
                value={param.value || ''}
                onChange={this.handleChange(index)}
                margin="normal"
              />
            )}
          </div>
        ))}
        <br />
      </Paper>
    );
  }
}

ParamList.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  header: PropTypes.string.isRequired,
  params: PropTypes.array.isRequired,
  updateParams: PropTypes.func.isRequired,
  tooltipText: PropTypes.string.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(ParamList);
