import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { configureStore, history } from './store/configureStore';
import './app.global.css';
import MenuAppBar from './components/MenuAppBar';
import 'typeface-roboto';

const store = configureStore();

render(<MenuAppBar />, document.getElementById('app-bar'));
