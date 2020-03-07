// @flow

export type Param = {
  name: ?string,
  displayName: ?string,
  value: ?string,
  type: string
};

export type SettingsObj = {
  bitsMode?: boolean,
  indentation?: string
};

export type RequireObj = {
  var1: string,
  displayVar1: string,
  comp: string,
  var2: string,
  displayVar2: string,
  requireMessage: string
};

export type Classes = { [key: string]: string };
