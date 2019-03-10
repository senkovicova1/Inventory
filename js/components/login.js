import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }

  render() {
    return (
      <View>
        <Text>RECIPEEEEES</Text>
          <Button
            onPress={() => {
              Alert.alert('You tapped the button!');
            }}
            title="Press Me"
          />

          <Button
            title="Go to Recipes"
            onPress={() => this.props.navigation.navigate('Recipes')}
          />
          <Button
            title="Go to Inventory"
            onPress={() => this.props.navigation.navigate('Inventory')}
          />
          <Button
            title="Go to Recipe"
            onPress={() => this.props.navigation.navigate('Recipe')}
          />
          <Button
            title="Go to AddRecipe"
            onPress={() => this.props.navigation.navigate('AddRecipe')}
          />
          <Button
            title="Go to AddInventory"
            onPress={() => this.props.navigation.navigate('AddInventory')}
          />
          <Button
            title="Go to AddIngredient"
            onPress={() => this.props.navigation.navigate('AddIngredient')}
          />
          <Button
            title="Go to EditRecipe"
            onPress={() => this.props.navigation.navigate('EditRecipe')}
          />
          <Button
            title="Go to EditInventory"
            onPress={() => this.props.navigation.navigate('EditInventory')}
          />
      </View>
    );
  }
}
