import React, { Component } from 'react';
import {Image, Platform, BackHandler} from 'react-native';
import { Container, Content, Header, Title, Toast, Card, CardItem, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';

import store from "../store/index";
import { logUser, logOffUser } from "../actions/index";

import firebase from 'firebase';
import { rebase } from '../../index';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import {isEmail} from '../helperFiles/helperFunctions.js';

//import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import styles from '../style';

const INGREDIENTS_INV = {
  9: "100 g",
  13: "50 g",
  14: "2 pcs",
  15: "500 g",
  16: "0.5 l",
};

const BASIC_INVENTORY = {
  name: "My first inventory",
  notes: "My first inventory. Both name and description can be changed by pressing the pencil icon on the right."
};

const INGREDIENTS_REC = {
  9: "-- g",
  13: "-- g",
  14: "1 pcs",
  15: "-- g",
  16: "-- tbsp",
};

const BASIC_RECIPE = {
  name: "Sweet potato fries",
  image: "https://firebasestorage.googleapis.com/v0/b/inventory-28bc0.appspot.com/o/recipes%2F16A230C5848?alt=media&token=a754a461-1db2-486b-ba46-ece47139384b",
  body: `1. Cut potatoes into stripes.\n2.Add salt, pepper and tumeric according to you preferences.\n3.Mix in some (or none) vegetable oil.\n4.Spread onto the baking sheet and bake for about 15 min on 200°C.`,
  ingredients: INGREDIENTS_REC,
};

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

      showError: false,
      error: "",
    };


    this.handleBackPress.bind(this);
    this.register.bind(this);
    this.login.bind(this);
    this.onLoginOrRegister.bind(this);
  }

  componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {

        store.dispatch(logUser({user: firebase.auth().currentUser}));

        if (store.getState().user !== null){
          this.props.navigation.push('Recipes');
        }
      });
    }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);

    this.authSubscription();
  }

  handleBackPress = () => {
    this.props.navigation.navigate("Login");
    return true;
  }

    login(){
      firebase.auth().signInWithEmailAndPassword(this.state.email.toLowerCase(),this.state.password1)
      .then((res)=>{
        store.dispatch(logUser({user: firebase.auth().currentUser}));
        if (store.getState().user !== null){
          this.props.navigation.push('Recipes');
        }
      }).catch(error=>{
        //could be no internet
        if (error.code === "auth/wrong-password"){
          this.setState({
            showError: true,
            error: "Wrong password or email!"
          });
        } else if (error.code === "auth/network-request-failed"){
          this.setState({
            showError: true,
            error: "A network error - one of the reasons may be that the device is not connected to the internet."
          });
        } else {
          this.setState({
            showError: true,
            error: "Error message: " + error.message,
          });
        }
        console.log(error.code);
        console.log(error);
      });
    }

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

        firebase.auth().createUserWithEmailAndPassword(this.state.email.toLowerCase(), this.state.password1)
        .then((user) => {

            store.dispatch(logUser({user: firebase.auth().currentUser}));

            let id = firebase.auth().currentUser.uid;
            let key = Date.now().toString(16).toUpperCase();

            rebase.post(`users/${id}`, {
              data: {username: this.state.username, lang: "eng"}
            }).then((data) => {
              let own = {};
              own[key] = id;
              rebase.post(`recipes/${key}`, {
                data: {...BASIC_RECIPE, owners: own}
              }).then((data2) => {
                rebase.post(`inventories/${key}`, {
                  data: {...BASIC_INVENTORY, owners: own}
                }).then((data3) => {
                  rebase.post(`foodInInventory/${key}`, {
                    data: INGREDIENTS_INV
                  }).then((data4) => {
                    if (store.getState().user !== null){
                      this.props.navigation.push('Recipes');
                    };
                  });
                });
              });
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
        store.dispatch(logUser({user: firebase.auth().currentUser}));

        let id = firebase.auth().currentUser.uid;

        rebase.fetch(`users/${id}`, {
          context: this,
        }).then((data) => {
          if (data.length === undefined){

            let key = Date.now().toString(16).toUpperCase();

            rebase.post(`users/${id}`, {
              data: {username: store.getState().user.displayName, lang: "eng", fb: store.getState().user.displayName}
            }).then((data) => {
              let own = {};
              own[key] = id;
              rebase.post(`recipes/${key}`, {
                data: {...BASIC_RECIPE, owners: own}
              }).then((data2) => {
                rebase.post(`inventories/${key}`, {
                  data: {...BASIC_INVENTORY, owners: own}
                }).then((data3) => {
                  rebase.post(`foodInInventory/${key}`, {
                    data: INGREDIENTS_INV
                  }).then((data4) => {
                    if (store.getState().user !== null){
                      this.props.navigation.push('Recipes');
                    };
                  });
                });
              });
            });
          }
        });

        if (store.getState().user !== null){
          this.props.navigation.push('Recipes');
        }
      })
      .catch((error) => {
        const { code, message } = error;
        console.log(code);
        console.log(message);
      });
    }

    render() {
      return (
        <Container>
          <Content
              style={styles.login}>
              <Image
                style={{ ...styles.inventoryLogo, ...styles.center }}
                source={require('../helperFiles/logoInvTrans.png')}
                />
              <Text style={{...styles.loginTextWelcomeInventory, ...styles.center}}>Inventory</Text>

              <Card transparent style={{...styles.welcomeCard}}>
                  <Text style={{...styles.loginTextWelcome, ...styles.center}}>Welcome</Text>

                  <Button
                    onPress={this.onLoginOrRegister.bind(this)}
                    style={{...styles.fbLoginButton, ...styles.center}} >
                    <Icon active style={{fontSize: 20}} name='logo-facebook' />
                    <Text>
                    Sign In with Facebook
                  </Text>
                  </Button>

                <Text style={{...styles.loginText, ...styles.center}}>
                  {"Or use your Inventory account "}
                </Text>
                  <Text style={{...styles.loginTextOr, ...styles.center}}>
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
                  <Card transparent style={{...styles.logCard}}>


                    { (this.state.showStuff && this.state.showSignUp)
                      &&
                      <Item  floatingLabel style={{...styles.floatingLabelLog}}>
                        <Icon active name='md-person' />
                        <Label>Username</Label>
                        <Input
                          type="name"
                          onChangeText={(text) => this.setState({username: text})}/>
                      </Item>
                    }

                    { this.state.showStuff
                      &&
                      <Item  floatingLabel style={{...styles.floatingLabelLog}}>
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
                    <Item error style={{...styles.errorItem}}>
                      <Icon active name='md-alert' style={{...styles.errorText}}/>
                      <Label style={{...styles.errorText}}>This is not a valid e-mail address!</Label>
                    </Item>
                  }

                      { this.state.showStuff
                        &&
                      <Item floatingLabel style={{...styles.floatingLabelLog}}>
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
                      <Item floatingLabel style={{...styles.floatingLabelLog}}>
                        <Icon active name='md-lock' />
                        <Label>Repeat Password</Label>
                        <Input
                          secureTextEntry={true}
                          type="password2"
                          onChangeText={(text) => this.setState({password2: text})}/>
                      </Item>
                    }

                  { (this.state.showSignUp && this.state.password1.length > 0 && this.state.password2.length > 0 && this.state.password1 !== this.state.password2)
                    &&
                    <Item style={{ ...styles.errorItem }}>
                      <Icon active name='md-alert' style={{ ...styles.errorText }}/>
                      <Label style={{...styles.errorText }}>Passwords do not match!</Label>
                    </Item>
                  }
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
                    style={{...styles.signUpButton, ...styles.center}}>
                    <Body>
                      <Text
                        style={{...styles.logInOutButtonText, ...styles.center}}>
                        Sign Up
                      </Text>
                    </Body>
                  </Button>
                }

                {this.state.showError
                  &&
                  Toast.show({
                    text: this.state.error,
                    duration: 4000,
                    type: 'danger'
                  })
                }

              </Card>
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
