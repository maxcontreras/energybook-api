/* @flow */

import React, { Component } from 'react';
import { createStackNavigator, createAppContainer, DrawerNavigator } from "react-navigation";

import {
  View,
  Text,
  StyleSheet,
  TextInput
} from 'react-native';
//import styles from './styles'





class Dashboard extends Component {
  render() {

    return (

        <TextInput  placeholder="Username"/>


    )
  }
}




const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Dashboard
