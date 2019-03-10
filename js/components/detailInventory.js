import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';

export default class DetailInventory extends Component {

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
            title="Go back"
            onPress={() => this.props.navigation.goBack()}
          />

          <Button
            title="Go to Recipes... again"
            onPress={() => this.props.navigation.push('Recipes')}
          />
      </View>
    );
  }
}
