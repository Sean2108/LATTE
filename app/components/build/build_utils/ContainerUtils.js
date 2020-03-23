// @flow

import * as React from 'react';
import Popover from '@material-ui/core/Popover';
import Typography from '@material-ui/core/Typography';

export function PopoverContainer({
  children,
  anchorEl,
  onClose
}: {
  children: React.Node,
  anchorEl: ?{},
  onClose: () => void
}): React.Node {
  return (
    <Popover
      id="simple-popper"
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      {children}
    </Popover>
  );
}

export function TabContainer({
  children
}: {
  children: React.Node
}): React.Node {
  return (
    <Typography
      component="div"
      style={{
        paddingTop: 24,
        paddingBottom: 24
      }}
    >
      {children}
    </Typography>
  );
}
