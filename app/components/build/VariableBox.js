import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button';

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
    }
});

class VariableBox extends React.Component {
    state = {
        variables: [],
        contents: ''
    };

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    render() {
        const {classes, theme, header, updateVariables} = this.props;
        return ( < Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > {
            header
        } < /Typography>

          <
          TextField id = "standard-name"
          label = "Variable Name"
          className = {
            classes.textField
          }
          onChange = {
            this.handleChange('contents')
          }
          value = {this.state.contents}
          margin = "normal" / > < Button variant = "contained" color = "primary" className = {
            classes.button
        }
        onClick = {
            () => {
                if (!this.state.contents || this.state.variables.includes(this.state.contents)) 
                    return;
                let newVars = [
                    ...this.state.variables,
                    this.state.contents
                ];
                this.setState({variables: newVars, contents: ''});
                updateVariables(newVars);
            }
        } > Add < AddIcon className = {
            classes.rightIcon
        } /> < /Button> <
          br / > {
            this
                .state
                .variables
                .map(element => < Paper key = {
                    element
                }
                className = {
                    classes.innerPaper
                } > {
                    element
                } < IconButton size = "small" className = {
                    classes.button
                }
                onClick = {
                    () => {
                        let vars = [...this.state.variables];
                        var index = vars.indexOf(element);
                        if (index !== -1) {
                            vars.splice(index, 1);
                            this.setState({variables: vars});
                            updateVariables(vars);
                        }
                    }
                } > < DeleteIcon / > < /IconButton> <
              /Paper >)
        } < /Paper>
            );
          }

        }

        VariableBox.propTypes = {
          classes: PropTypes.object.isRequired,
          theme: PropTypes.object.isRequired,
          header: PropTypes.string.isRequired,
          updateVariables: PropTypes.func
        };

        export default withStyles(styles, {
          withTheme: true
        })(VariableBox);