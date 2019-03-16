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
      email:'',
      password:'',
      username: '',
      token:null,
      avatar: null,
    };

    const USER = store.getState().user === null;
    if (USER){
      this.props.navigation.navigate('Login');
    }

    this.signOut.bind(this);
  }

  /**
     * When the App component mounts, we listen for any authentication
     * state changes in Firebase.
     * Once subscribed, the 'user' parameter will either be null
     * (logged out) or an Object (logged in)
     */
  componentDidMount() {
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        this.setState({
          user,
        });
      });
    }
  /**
   * Don't forget to stop listening for authentication state changes
   * when the component unmounts.
   */
  componentWillUnmount() {
    this.authSubscription();
  }


  signOut(){
    firebase.auth().signOut();
    store.dispatch(logOffUser(null));
    const USER = store.getState().user === null;
    this.props.navigation.push('Login');

  }


    render() {
      console.log(store.getState());
      const WITH_FB = store.getState().withFB === true;
      return (
        <Container>
          <Content
              style={styles.login}>
              <Text>Settings</Text>

            {WITH_FB
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
            {!WITH_FB
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
