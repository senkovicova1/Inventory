/*import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';

import Navigator from './navigation';

*/
import React, {Component} from "react";
import { View, Text, Button } from "react-native";
import { Root } from "native-base";
import { createStackNavigator, createAppContainer } from "react-navigation";

import Login from './components/login';
import Settings from './components/settings';

import ListRecipes from './components/listRecipes';

import DetailRecipe from './components/detailRecipe';
import DetailInventory from './components/detailInventory';

import AddRecipe from './components/addRecipe';
import AddInventory from './components/addInventory';
import AddIngredient from './components/addIngredient';

import EditRecipe from './components/editRecipe';


const AppNavigator = createStackNavigator(
  {
    Login: Login,
    Settings: Settings,

    Recipes: ListRecipes,

    Inventory: DetailInventory,
    Recipe: DetailRecipe,

    AddRecipe: AddRecipe,
    AddInventory: AddInventory,
    AddIngredient: AddIngredient,

    EditRecipe: EditRecipe,
  },
  {
    initialRouteName: "Login",
    defaultNavigationOptions: {
      header: null,
   },
  });

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return (
    <Root>
      <AppContainer />
    </Root>);
  }
}
