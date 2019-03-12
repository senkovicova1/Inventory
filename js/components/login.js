import React, { Component } from 'react';
import { Container, Header, Title, Content, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';
import firebase from 'firebase';

import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import { LoginButton, AccessToken } from 'react-native-fbsdk';

const ACC_VIO = 'rgb(124, 90, 150)';
const ACC_CREAM = 'rgb(252, 244, 217)';
const ACC_PEACH = 'rgb(255, 184, 95)';
const ACC_DARK_PEACH = 'rgb(255, 122, 90)';
const ACC_TEAL = 'rgb(142, 210, 210)';
const ACC_DARK_TEAL = 'rgb(0, 170, 160)';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email:'',
      password:'',
      username: '',
      token:null,
      avatar: null,
    };

    this.register.bind(this);
    this.login.bind(this);
    this.initUser.bind(this);
  }

  login(){
      firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password).then((res)=>{
        this.setState({token:res});
        console.log("REGISTERED");
        console.log(res);
      }).catch(error=>{console.log(error)});
    }

    register(){
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
    }

/*
    <GoogleSigninButton
      style={{ width: 192, height: 48 }}
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={() => this.onLoginOrRegister()}
      disabled={false} />


    onLoginOrRegister = () => {
      console.log("trying");
      GoogleSignin.signIn()
        .then((data) => {
          // Create a new Firebase credential with the token
          const credential = firebase.auth.GoogleAuthProvider.credential(data.idToken, data.accessToken);
          // Login with the credential
          console.log("credential");
          console.log(credential);
          return firebase.auth().signInWithCredential(credential);
        })
        .then((user) => {
          console.log("user");
          console.log(user);
          // If you need to do anything with the user, do it here
          // The user will be logged in automatically by the
          // `onAuthStateChanged` listener we set up in App.js earlier
        })
        .catch((error) => {
          const { code, message } = error;
          console.log(code);
          console.log(message);
          // For details of error codes, see the docs
          // The message contains the default Firebase string
          // representation of the error
        });
    }
    */

    initUser(token) {
      fetch('https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
        // Some user object has been set up somewhere, build that user here
    /*    user.name = json.name
        user.id = json.id
        user.user_friends = json.friends
        user.email = json.email
        user.username = json.name
        user.loading = false
        user.loggedIn = true
        user.avatar = setAvatar(json.id)*/
        this.setState({
          email: json.email,
          username: json.name,
          avatar: setAvatar(json.id),
          id: json.id,
        });
        console.log("info ");
        console.log(json.email);
        console.log(json.name);
        console.log(json.id);
      })
      .catch(() => {
        console.log('ERROR GETTING DATA FROM FACEBOOK');
      })
    }

  render() {
    return (
      <Container style={{backgroundColor:'white'}}>
        <Content>
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

          {/*        <Input
            placeholder="E-mail"
            type="email"
            onChangeText={(text) => this.setState({email: text})}/>
          <Input
            placeholder="Password"
            type="password"
            onChangeText={(text) => this.setState({password: text})}/>
          <Button onPress={this.login.bind(this)} >
            <Text>
            Login
          </Text>
          </Button>
          <Button onPress={this.register.bind(this)} >
            <Text>
            Register
          </Text>
        </Button>*/}
        </Content>
        </Container>
    );
  }
}
