import React, { Component } from 'react';
import { Container, Header, Title, Card, Content, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';

import store from "../store/index";
import { logUser, logOffUser } from "../actions/index";

import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

//import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import styles from '../style';

export default class Settings extends Component {

  constructor(props) {
    super(props);
    this.state = {
    };
    this.signOut.bind(this);
  }


  signOut(){
    firebase.auth().signOut();
    store.dispatch(logOffUser(null));
    this.props.navigation.push('Login');
  }

    render() {
      console.log("settings");
      console.log(store.getState().user.providerData);
      return (
        <Container>
          <Content
              style={styles.login}>
              <Text>Settings</Text>

            {(store.getState().user.providerData[0].providerId === 'facebook.com')
              &&
              <LoginButton
                readPermissions={['public_profile', 'email']}
                onLoginFinished={
                  (error, result) => {
                    console.log("um..");
                  }
                }
                onLogoutFinished={() => this.signOut()}/>
            }
            {(store.getState().user.providerData[0].providerId !== 'facebook.com')
              &&
              <Button
                onPress={() => this.signOut()} >
                <Text>
                Sign out
                </Text>
              </Button>
            }

          </Content>
          </Container>
      );
    }
}

/*

        <Button
          onPress={() => firebase.auth().signOut().then((stuff) => console.log("eh" + stuff + "eh"))} >
          <Text>
          Sign out
          </Text>
        </Button>
*/
