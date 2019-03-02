import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';

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
      updateParams
    } = this.props;

    return (
      <Paper className={classes.paper}>
        {' '}
        <Typography variant="title" noWrap>
          {' '}
          {header}{' '}
        </Typography>
        <br />
        {params.filter(param => param.name).map((param, index) => (
          <div key={index}>
            <TextField
              id="value"
              label={`Value of ${param.displayName || ''}`}
              className={classes.textField}
              value={param.value || ''}
              onChange={this.handleChange(index)}
              margin="normal"
            />
          </div>
        ))}
        <br />{' '}
      </Paper>
    );
  }
}

ParamList.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
  header: PropTypes.string.isRequired,
  params: PropTypes.array.isRequired,
  updateParams: PropTypes.func.isRequired
};

export default withStyles(styles, {
  withTheme: true
})(ParamList);
