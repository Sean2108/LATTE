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
import Popover from '@material-ui/core/Popover';
import Grid from '@material-ui/core/Grid';
import VariableList from './VariableList';

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
        maxHeight: '40vw',
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
        this.setState({[name]: event.target.value});
    };

    render() {
        const {classes, theme, header, updateVariables, initialVars} = this.props;
        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > {
            header
        } < /Typography>
        <br/>
        <Grid container spacing={24}>
        {
            Object.keys(initialVars).map((key) => 
                    <Grid item xs={6} key={key}>
                    <
                VariableList header = {
                    key
                }
                updateVariables = {
                    (vars) => updateVariables({...initialVars, [key]: vars})
                }
                vars = {initialVars[key]} / >
                </Grid>)
    }
        </Grid> 
        < TextField id = "standard-name"
    label = {header === "Entities" ? "Entity Name" : "Event Name"}
    className = {
        classes.textField
    }
    onChange = {
        this.handleChange('contents')
    }
    value = {
        this.state.contents
    }
    margin = "normal" / > < Button variant = "contained" color = "primary" className = {
        classes.button
    }
    onClick = {
        () => {
            if (!this.state.contents || this.state.contents in initialVars) 
                return;
            updateVariables({
                ...initialVars,
                [this.state.contents]: []
            });
            this.setState({contents: ''});
        }
    } > Add < AddIcon className = {
        classes.rightIcon
    } /> < /Button> <
          br / > < /Paper>
            );
          }

        }

        StructList.propTypes = {
          classes: PropTypes.object.isRequired,
          theme: PropTypes.object.isRequired,
          header: PropTypes.string.isRequired,
          updateVariables: PropTypes.func,
          initialVars: PropTypes.object.isRequired
        };

        export default withStyles(styles, {
          withTheme: true
        })(StructList);