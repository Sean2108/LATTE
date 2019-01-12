import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import BuildDiagram from './BuildDiagram';
import RequiresList from './RequiresList';
import VariableList from './VariableList';
import VariableBox from './VariableBox';
import StructList from './StructList';
import Grid from '@material-ui/core/Grid';
import DefaultBuildTab from './DefaultBuildTab';

function TabContainer(props) {
    return (
    < Typography component = "div" style = {
        {
            padding: 8 * 3
        }
    } > {
        props.children
    } < /Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    tabs: {
        flexGrow: 1,
        width: '97%',
        backgroundColor: theme.palette.background.paper,
    },
});

class BuildTabs extends React.Component {
        state = {
            value: 0,
            variables: [],
            constructorParams: [],
            entities: {},
            events: {}
        };

        handleChange = (event, value) => {
            this.setState({
                value
            });
        };

        render() {
            const {
                classes
            } = this.props;
            const {
                value
            } = this.state;

            return ( <
                div className = {
                    classes.tabs
                } >
                <
                AppBar position = "static"
                color = "default" >
                <
                Tabs value = {
                    value
                }
                onChange = {
                    this.handleChange
                }
                indicatorColor = "primary"
                textColor = "primary"
                scrollable scrollButtons = "auto" >
                <
                Tab label = "Global State" / >
                <
                Tab label = "Initial State" / > < Tab label = "Delegate" / > < Tab label = "Vote" / > < Tab label = "Winning Proposal" / > < Tab label = "Winner Name" / > < Tab label = "+" / > < /Tabs> < /AppBar > {
        value === 0 && < TabContainer > < StructList header = {
            "Entities"
        } updateVariables = {(entities) => this.setState({...this.state, entities : entities})}
        initialVars = {this.state.entities}/ > <br/> < StructList header = {
            "Events"
        } updateVariables = {(events) => this.setState({...this.state, events : events})}
        initialVars = {this.state.events}/ > <br/>
        < Grid container spacing = {
            24
        } > < Grid item xs = {
            6
        } > < VariableBox header = {
            "Variables"
        }
        updateVariables = {
            (vars) => this.setState({...this.state, variables: vars})
        }
        initialVars = {this.state.variables}
        // VariableList header = {   "Global State Objects" } isInput = {   false }
        /> < /Grid > < Grid item xs = {
            6
        } > <
        // VariableList header = {   "Constructor Parameters" } isInput = {   true }
        VariableBox header = {
            "Constructor Parameters"
        } 
        updateVariables = {
            (vars) => this.setState({...this.state, constructorParams: vars})
        }
        initialVars = {this.state.constructorParams}/> < /
                    Grid > <
                    /Grid >  < /TabContainer>} 
                    {
                        value === 1 && <TabContainer>
                        < RequiresList updateVariables = {
                            this.updateVariables
                        }
                        header = {
                            "Checking Phase"
                        }
                        vars = {
                            this.state.variables
                        } /> < br / > < BuildDiagram varList = {
                            this.state.variables
                        } 
                        events = {this.state.events}
                        / >
                        </TabContainer>
                    }
                    {
                    value === 2 && <TabContainer> <DefaultBuildTab varList = {this.state.variables} events = {this.state.events} /> </TabContainer>} {
                    value === 3 && <TabContainer> <DefaultBuildTab varList = {this.state.variables} events = {this.state.events} /> </TabContainer>
    }
    {
        value === 4 && <TabContainer> <DefaultBuildTab varList = {this.state.variables} events = {this.state.events} /> </TabContainer>} {
                    value === 5 && <TabContainer> <DefaultBuildTab varList = {this.state.variables} events = {this.state.events} /> </TabContainer>
    }
    {
        value === 6 && < TabContainer > + < /TabContainer>} < /div >);
    }
}

BuildTabs.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(BuildTabs);
