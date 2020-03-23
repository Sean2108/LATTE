import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import type { Classes } from '../../../types';

const styles = {
  tabs: {
    width: '100%',
    maxWidth: '80vw'
  }
};

type Props = {
  classes: Classes,
  tabs: Array<string>,
  value: number,
  setAnchorEl: (?{}) => void,
  changeTab: (event: {}, val: number) => void
};

class TabBar extends React.Component<Props> {
  render(): React.Node {
    const { classes, value, tabs, setAnchorEl, changeTab } = this.props;

    return (
      <Tabs
        className={classes.tabs}
        value={value}
        onChange={(event: {}, val: number): void => {
          if (val !== tabs.length) {
            changeTab(event, val);
          }
        }}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        {tabs.map((label: string) => (
          <Tab label={label} key={label} />
        ))}
        <Tab
          onClick={(event: SyntheticInputEvent<>) =>
            setAnchorEl(event.currentTarget)
          }
          label="+"
        />
      </Tabs>
    );
  }
}

export default withStyles(styles)(TabBar);
