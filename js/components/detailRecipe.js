import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';

export default class DetailRecipe extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }

  render() {
    return (
      <View>
        <Text>FUCKKKK -_____________-</Text>
          <Button
            onPress={() => {
              Alert.alert('You tapped the button!');
            }}
            title="Press Me"
          />
      </View>
    );
  }
}
