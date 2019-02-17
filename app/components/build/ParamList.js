import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit
    },
    dense: {
        marginTop: 16
    },
    menu: {
        width: 200
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'center',
        color: theme.palette.text.secondary,
        maxHeight: '20vw',
        overflow: 'auto'
    },
    innerPaper: {
        height: 45,
        width: 'max-content',
        padding: theme.spacing.unit,
        display: 'inline-block',
        margin: theme.spacing.unit
    },
    button: {
        margin: 0
    },
    rightIcon: {
        marginLeft: theme.spacing.unit
    },
    entityName: {
        display: 'flex',
        'justify-content': 'center',
        margin: 'auto'
    },
    entityHeader: {
        'flex-grow': 2
    },
    row: {
        display: 'flex'
    }
});

class ParamList extends React.Component {
    state = {
        params: []
    };

    handleChange = (index) => event => {
        let params = [...this.state.params];
        params[index].value = event.target.value;
        this.setState({params: params});
        this.props.updateParams(params);
    };

    componentWillMount() {
        this.setState({params: this.props.params});
    }

    render() {
        const {classes, theme, header, updateVariables, params, updateParams} = this.props;
        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > {
            header
        } < /Typography>
        <br/>
        {this.state.params.map((param, index) => <div key={index}>
        <InputLabel htmlFor = "value" > {param.name}: </InputLabel>
        <TextField
          id="value"
          label="Value"
          className={classes.textField}
          value={param.value}
          onChange={this.handleChange(index)}
          margin="normal"
        /></div>)}
         <
          br / > < /Paper>
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