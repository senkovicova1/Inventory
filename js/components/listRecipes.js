import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import { Drawer } from 'native-base';
import Sidebar from './sidebar';

import {ACC_VIO} from '../helperFiles/colours';

export default class ListRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
      recipes: [],
    };
  }
    closeDrawer = () => {
      this.drawer._root.close()
    };
    openDrawer = () => {
      this.drawer._root.open()
    };

  render() {
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigator={this.navigator} />}
        onClose={() => this.closeDrawer()} >
        <View>
          <Button
            title="Go back"
            onPress={() => this.openDrawer()}
          />
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
              title="Go to Recipes"
              onPress={() => this.props.navigation.push('Recipes')}
            />
            <Button
              title="Go to Login"
              onPress={() => this.props.navigation.push('Login')}
            />
        </View>
      </Drawer>

    );
  }
}
