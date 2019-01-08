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
    }
});

class StructList extends React.Component {
    state = {
        entities: {},
        contents: '',
        propcontents: '',
        modalAdd: '',
        anchor: null
    };

    handleChange = name => event => {
        this.setState({[name]: event.target.value});
    };

    render() {
        const {classes, theme, header, updateVariables} = this.props;
        return (< Paper className = {
            classes.paper
        } > < Typography variant = "title" noWrap > {
            header
        } < /Typography>
        <br/>
        <Popover
          id="simple-popper"
          open={this.state.anchor != null}
          anchorEl={this.state.anchor}
          onClose={() => this.setState({anchor: null})}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          < TextField id = "standard-name"
    label = {header === "Entities" ? "Entity Property Name" : "Property to Display"}
    className = {
        classes.textField
    }
    onChange = {
        this.handleChange('propcontents')
    }
    value = {
        this.state.propcontents
    }
    margin = "normal" / > < Button variant = "contained" color = "primary" className = {
        classes.button
    }
    onClick = {
        () => {
            if (!this.state.propcontents || this.state.entities[this.state.modalAdd].includes(this.state.propcontents)) 
                return;
            let newVars = {...this.state.entities};
            newVars[this.state.modalAdd].push(this.state.propcontents);
            this.setState({entities: newVars, propcontents: '', anchor: null});
            updateVariables(newVars);
        }
    } > Add < AddIcon className = {
        classes.rightIcon
    } /> < /Button>
        </Popover>
        <Grid container spacing={24}>
        {
            Object.keys(this.state.entities).map((key) => 
            <Grid item xs={6} key={key}>
            <Paper className = {
                    classes.paper
                }>
                <div className = {classes.entityName}>
                <Typography className = {classes.entityHeader} variant="display1" noWrap>{key}</Typography >< IconButton size = "small" className = {
                    classes.button
                }
                onClick = {
                    () => {
                        let vars = {...this.state.entities};
                        delete vars[key];
                        this.setState({entities: vars});
                        // updateVariables(vars);
                    }
                } > < DeleteIcon / > < /IconButton>
                < IconButton size = "small" className = {
                    classes.button
                }
                onClick = {
                    (event) => {
                        this.setState({anchor: event.currentTarget, modalAdd: key});
                    }
                } > < AddIcon / > < /IconButton> </div> {
                this
                .state
                .entities[key]
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
                        let vars = {...this.state.entities};
                        var index = vars[key].indexOf(element);
                        if (index !== -1) {
                            vars[key].splice(index, 1);
                            this.setState({entities: vars});
                            updateVariables(vars);
                        }
                    }
                } > < DeleteIcon / > < /IconButton> <
              /Paper >)}
              </Paper>
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
            if (!this.state.contents || this.state.contents in this.state.entities) 
                return;
            let newVars = {
                ...this.state.entities,
                [this.state.contents]: []
            };
            this.setState({entities: newVars, contents: ''});
            updateVariables(newVars);
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
          updateVariables: PropTypes.func
        };

        export default withStyles(styles, {
          withTheme: true
        })(StructList);