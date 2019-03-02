import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import './app.global.css';
import MenuAppBar from './components/MenuAppBar';
import 'typeface-roboto';

render(<MenuAppBar />, document.getElementById('app-bar'));
