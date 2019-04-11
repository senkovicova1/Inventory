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

import AddRecipeCreate from './components/addRecipeCreate';
import AddRecipeBarcode from './components/addRecipeBarcode';
import AddInventory from './components/addInventory';
import AddIngredientBarcode from './components/addIngredientBarcode';
import AddIngredientManual from './components/addIngredientManual';

import EditRecipe from './components/editRecipe';


const AppNavigator = createStackNavigator(
  {
    Login: Login,
    Settings: Settings,

    Recipes: ListRecipes,

    Inventory: DetailInventory,
    Recipe: DetailRecipe,

    AddRecipeCreate: AddRecipeCreate,
    AddRecipeBarcode: AddRecipeBarcode,
    AddInventory: AddInventory,
    AddIngredientBarcode: AddIngredientBarcode,
    AddIngredientManual: AddIngredientManual,

    EditRecipe: EditRecipe,
  },
  {
    initialRouteName: "Login",
    backBehavior: 'none',
    cardOverlayEnabled: true,
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
