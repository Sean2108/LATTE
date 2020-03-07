// @flow

export type Classes = { [key: string]: string };
export type VariablesLookupType = { [key: string]: string };
export type StructLookupType = { [key: string]: Array<VariableObj> };

type VariableType = 'uint' | 'bool' | 'address payable' | 'string';

export type Param = {
  name: ?string,
  displayName: ?string,
  value: string | void,
  type: VariableType,
  bits: ?(number | string)
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

export type VariableObj = {
  name: string,
  displayName: string,
  type: VariableType,
  bits: ?(number | string)
};