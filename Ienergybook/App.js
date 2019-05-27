/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
//import {Platform, StyleSheesssst, Text, View, Button} from 'react-native';
import { createStackNavigator, createAppContainer } from "react-navigation";
import Home from './app/Components/Home';
import Dashboard from './app/Components/Dashboard';

const AppNavigator = createStackNavigator({
  Home: Home,
  Dashboard: Dashboard

});

export default createAppContainer(AppNavigator);
