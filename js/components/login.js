import React, { Component } from 'react';
import { Container, Content, Header, Title, Card, CardItem, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';

import store from "../store/index";
import { logUser, logOffUser } from "../actions/index";

import firebase from 'firebase';
import { rebase } from '../../index.android';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import {isEmail} from '../helperFiles/helperFunctions.js';

//import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import styles from '../style';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email:'',
      password1:'',
      password2:'',
      username: '',
      token:null,
      avatar: null,
      loading: true,
      showStuff: false,
      showSignUp: false,
      showNotAllFieldsFilled: false,
      validMail: false,
    };


    this.register.bind(this);
    this.login.bind(this);
    this.onLoginOrRegister.bind(this);
    this.initUser.bind(this);
  }

  componentDidMount() {
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        console.log('USER');
        console.log(firebase.auth().currentUser);
        store.dispatch(logUser({user, withFB: false}));
      });
      if (store.getState().user !== null){
        this.props.navigation.push('Recipes');
      }
    }

  componentWillUnmount() {
    this.authSubscription();
  }

    login(){
      firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password)
      .then((res)=>{
        this.setState({token:res});
        console.log("REGISTERED");
        console.log(res);
      }).catch(error=>{console.log(error)});
    }
//r9WmspdO8QalOLN0oU90SFG8CRu2
    register(){
      if (this.state.username.length === 0
      || this.state.email.length === 0
      || !this.state.validMail
      || this.state.password1.length === 0
      || this.state.password2.length === 0
      || this.state.password1 !== this.state.password2){
        this.setState({showNotAllFieldsFilled: true});
        return;
      }

      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password1)
      .then((user) => {
        store.dispatch(logUser({user, withFB: false}));
        let id = Date.now().toString(16).toUpperCase();
        rebase.post(`users/${id}`, {
          data: {username: this.state.username, withFB: false}
        });
      });

    }

    onLoginOrRegister(){
      LoginManager.logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => {
        if (result.isCancelled) {
          console.log('The user cancelled the request');
          return Promise.reject(new Error('The user cancelled the request'));
        }
        return AccessToken.getCurrentAccessToken();
      })
      .then((data) => {
        const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
        return firebase.auth().signInWithCredential(credential);
      })
      .then((user) => {
        store.dispatch(logUser({user, withFB: true}));
        const USER = store.getState().user !== null;
        if (USER){
          this.props.navigation.navigate('Settings');
        }
      })
      .catch((error) => {
        const { code, message } = error;
        console.log(code);
        console.log(message);
      });
    }


    initUser(token) {
      fetch('https://graph.facebook.com/v2.5/me?fields=email,name,friends&access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
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
      console.log(store.getState());

      return (
        <Container>
          <Content
              style={styles.login}>
              <Text style={{...styles.loginTextWelcome, ...styles.center}}>Welcome to Inventory</Text>
              <Text>obr</Text>

                <Button
                  onPress={this.onLoginOrRegister.bind(this)}
                  style={{...styles.fbLoginButton, ...styles.center}} >
                  <Icon active name='logo-facebook' />
                  <Text>
                  Sigh In with Facebook
                </Text>
                </Button>

              <Text style={{...styles.loginText, ...styles.center}}>
                {"Or use your Inventory account - "}
                <Text
                  style={{...styles.createOrLog}}
                  onPress={() => this.setState({showStuff: true, showSignUp: true})}>
                  create one
                </Text>
                {" or "}
                <Text
                  style={{...styles.createOrLog}}
                  onPress={() => this.setState({showStuff: true, showSignUp: false})}>
                  log in
                </Text>
              </Text>

        {(this.state.showStuff || this.state.showSignUp)
          &&
          <Card>
            <CardItem header>
              <Text>User data</Text>
            </CardItem>
            <CardItem>
              <Body>

              {this.state.showNotAllFieldsFilled
              &&
              <Item error>
                <Icon active name='md-alert' />
                <Label>All fields have to be filled!</Label>
              </Item>
              }

            { (this.state.showStuff && this.state.showSignUp)
              &&
              <Item  floatingLabel>
                <Icon active name='md-person' />
                <Label>Username</Label>
                <Input
                  type="name"
                  onChangeText={(text) => this.setState({username: text})}/>
              </Item>
            }

            { this.state.showStuff
              &&
              <Item  floatingLabel>
                <Icon active name='md-mail' />
                <Label>E-mail</Label>
                <Input
                  type="email"
                  onChangeText={(text) => this.setState({email: text, validMail: isEmail(text)})}/>

            </Item>
            }
            {(this.state.email.length > 0
              && !this.state.validMail)
            &&
            <Item error style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(255, 0, 0)'}}>
              <Icon active name='md-alert' style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(255, 0, 0)'}}/>
              <Label style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(255, 0, 0)'}}>This is not a valid e-mail address!</Label>
            </Item>
          }

              { this.state.showStuff
                &&
              <Item floatingLabel>
                <Icon active name='md-lock' />
                <Label>Password</Label>
                <Input
                  secureTextEntry={true}
                  type="password1"
                  onChangeText={(text) => this.setState({password1: text})}/>
              </Item>
            }

            { (this.state.showStuff && this.state.showSignUp)
              &&
              <Item floatingLabel>
                <Icon active name='md-lock' />
                <Label>Repeat Password</Label>
                <Input
                  secureTextEntry={true}
                  type="password2"
                  onChangeText={(text) => this.setState({password2: text})}/>
              </Item>
            }
            </Body>
          </CardItem>

          <CardItem footer>
          { (this.state.password1.length > 0 && this.state.password2.length > 0 && this.state.password1 !== this.state.password2)
            &&
            <Item error style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(255, 0, 0)'}}>
              <Icon active name='md-alert' style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(255, 0, 0)'}}/>
              <Label style={{color: 'rgb(255, 255, 255)', backgroundColor: 'rgb(255, 0, 0)'}}>Passwords do not match!</Label>
            </Item>
          }
        </CardItem>
          </Card>
}
          {(this.state.email.length !== 0
            && this.state.validMail
          && this.state.password1.length !== 0
          && !this.state.showSignUp)
            &&
            <Button
              onPress={this.login.bind(this)}
              style={{...styles.logInOutButton, ...styles.center}}>
              <Body>
                <Text
                  style={{...styles.logInOutButtonText, ...styles.center}}>
                  Login
                </Text>
              </Body>
            </Button>
          }

          { (this.state.username.length !== 0
          && this.state.email.length !== 0
          && this.state.validMail
          && this.state.password1.length !== 0
          && this.state.password2.length !== 0
          && this.state.password1 === this.state.password2
          && this.state.showSignUp)
            &&
            <Button
              onPress={this.register.bind(this)}
              style={{...styles.logInOutButton, ...styles.center}}>
              <Body>
                <Text
                  style={{...styles.logInOutButtonText, ...styles.center}}>
                  Sign Up
                </Text>
              </Body>
            </Button>
          }


          </Content>
          </Container>
      );
    }
}

/*
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
*/


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
