// @flow

import * as React from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import WifiIcon from '@material-ui/icons/Wifi';
import SettingsIcon from '@material-ui/icons/Settings';
import { existsSync, readFile, writeFile } from 'fs';
import Web3 from 'web3';
import Connect from './Connect';
import Settings from './Settings';
import Build from './build/Build';

const drawerWidth: number = 240;

const styles = theme => ({
  root: {
    flexGrow: 1,
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    position: 'relative',
    display: 'flex'
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    })
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  menuButton: {
    marginLeft: 12,
    marginRight: 36
  },
  hide: {
    display: 'none'
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    height: '100%',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen
    })
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9
    }
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar
  }
});

const selection: { [key: string]: number } = {
  CONNECT: 1,
  SETTINGS: 2,
  BUILD: 3
};

const settingsFile: string = './settings.json';

type SettingsObj = {
  bitsMode?: boolean,
  indentation?: string
};

type Props = {
  classes: { [key: string]: string },
  theme: { direction: string }
};

type State = {
  open: boolean,
  selected: number,
  connection: ?Web3,
  settings: SettingsObj
};

class MiniDrawer extends React.Component<Props, State> {
  state = {
    open: false,
    selected: selection.CONNECT,
    connection: null,
    settings: {
      bitsMode: false,
      indentation: '    '
    }
  };

  componentWillMount(): void {
    if (existsSync(settingsFile)) {
      readFile(settingsFile, (err: ?Error, data: Buffer) => {
        if (err) throw err;
        if (!data) {
          return;
        }
        const parsedData: SettingsObj = JSON.parse(data.toString());
        this.setState({
          settings: {
            bitsMode: parsedData.bitsMode || false,
            indentation: parsedData.indentation || '    '
          }
        });
      });
    }
  }

  handleDrawerOpen = (): void => {
    this.setState({
      open: true
    });
  };

  handleDrawerClose = (): void => {
    this.setState({
      open: false
    });
  };

  goToBuild = (connection: Web3): void =>
    this.setState({
      selected: selection.BUILD,
      connection
    });

  goToConnect = (): void =>
    this.setState({
      selected: selection.CONNECT
    });

  selectShown = (selected: number): React.Node => {
    const { settings, connection } = this.state;
    switch (selected) {
      case selection.CONNECT:
        return <Connect onclick={this.goToBuild} />;
      case selection.SETTINGS:
        return (
          <Settings
            settings={settings}
            changeSettings={(newVal: SettingsObj) => {
              const newSettings: SettingsObj = { ...settings, ...newVal };
              writeFile(
                settingsFile,
                JSON.stringify(newSettings),
                (err: ?Error): void => {
                  this.setState({ settings: newSettings });
                  if (err) throw err;
                }
              );
            }}
          />
        );
      case selection.BUILD:
        return (
          <Build
            onback={this.goToConnect}
            connection={connection}
            settings={settings}
          />
        );
      default:
        return null;
    }
  };

  render() {
    const { classes, theme } = this.props;
    const { open, selected } = this.state;

    return (
      <div className={classes.root}>
        <AppBar
          position="absolute"
          className={classNames(classes.appBar, open && classes.appBarShift)}
        >
          <Toolbar disableGutters={!open}>
            <IconButton
              color="inherit"
              aria-label="Open drawer"
              onClick={this.handleDrawerOpen}
              className={classNames(classes.menuButton, open && classes.hide)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" noWrap>
              LATTE
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: classNames(
              classes.drawerPaper,
              !open && classes.drawerPaperClose
            )
          }}
          open={open}
        >
          <div className={classes.toolbar}>
            <IconButton onClick={this.handleDrawerClose}>
              {theme.direction === 'rtl' ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </div>
          <Divider />
          <List>
            <div>
              <ListItem
                button
                onClick={(): void => {
                  this.setState({
                    selected: selection.CONNECT
                  });
                }}
              >
                <ListItemIcon>
                  <WifiIcon />
                </ListItemIcon>
                <ListItemText primary="Connect" />
              </ListItem>
            </div>
          </List>
          <Divider />
          <List>
            <div>
              <ListItem
                button
                onClick={(): void => {
                  this.setState({
                    selected: selection.SETTINGS
                  });
                }}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItem>
            </div>
          </List>
        </Drawer>
        {this.selectShown(selected)}
      </div>
    );
  }
}

export default withStyles(styles, {
  withTheme: true
})(MiniDrawer);
