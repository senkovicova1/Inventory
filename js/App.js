/*import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';

import Navigator from './navigation';

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }

  render() {
    return (
      <View>
      <Text>assadada</Text>
        <Navigator />
        <Text>assadada</Text>
      </View>
    );
  }
}*/

import React from "react";
import { View, Text, Button } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";

import Login from './components/login';

import ListRecipes from './components/listRecipes';

import DetailRecipe from './components/detailRecipe';
import DetailInventory from './components/detailInventory';

import AddRecipe from './components/addRecipe';
import AddInventory from './components/addInventory';
import AddIngredient from './components/addIngredient';

import EditRecipe from './components/editRecipe';
import EditInventory from './components/editInventory';


const AppNavigator = createStackNavigator(
  {
    Login: Login,

    Recipes: ListRecipes,

    Inventory: DetailInventory,
    Recipe: DetailRecipe,

    AddRecipe: AddRecipe,
    AddInventory: AddInventory,
    AddIngredient: AddIngredient,

    EditRecipe: EditRecipe,
    EditInventory: EditInventory,
  },
  {
    initialRouteName: "Recipes",
    defaultNavigationOptions: {
      header: null,
   },
  });

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
