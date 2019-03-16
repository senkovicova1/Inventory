import React, {Component} from 'react';
import {Text, View, Button, Alert} from 'react-native';
import { Drawer } from 'native-base';
import Sidebar from './sidebar';

import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

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

    componentDidMount() {
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
          console.log(user);
          this.setState({
            loading: false,
            user,
          });
        });
      }
  componentWillUnmount() {
      this.authSubscription();
    }

  render() {
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
        onClose={() => this.closeDrawer()} >
        <View>

          <Button
            title='Sign Out'
            onPress={() => firebase.auth().signOut()} />

          <LoginButton
            readPermissions={['public_profile', 'email']}
            onLoginFinished={
              (error, result) => {
                console.log("um..");
                if (error) {
                  console.log("login has error: " + result.error);
                } else if (result.isCancelled) {
                  console.log("login is cancelled.");
                } else {
                  console.log("trial");
                  AccessToken.getCurrentAccessToken().then(
                    (data) => {
                      console.log("SUCCESS");
                      console.log(data);
                      const { accessToken } = data;
                      this.initUser(accessToken);
                    }
                  )
                }
              }
            }
            onLogoutFinished={() => console.log("logout.")}/>

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
