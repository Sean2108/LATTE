import React from 'react';
import { render } from 'react-dom';
import './app.global.css';
import MenuAppBar from './components/MenuAppBar';
import 'typeface-roboto';

render(<MenuAppBar />, document.getElementById('app-bar'));
