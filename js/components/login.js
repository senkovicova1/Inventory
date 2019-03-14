import React, { Component } from 'react';
import { Container, Header, Title, Card, Content, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';

import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

//import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import styles from '../style';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email:'',
      password:'',
      username: '',
      token:null,
      avatar: null,
      loading: true,
      showStuff: false,
      showSignUp: false,
    };

    this.register.bind(this);
    this.login.bind(this);
    this.onLoginOrRegister.bind(this);
    this.initUser.bind(this);
  }

  /**
     * When the App component mounts, we listen for any authentication
     * state changes in Firebase.
     * Once subscribed, the 'user' parameter will either be null
     * (logged out) or an Object (logged in)
     */
  componentDidMount() {
    console.log("eh");
      this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
        this.setState({
          loading: false,
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

    onLoginOrRegister(){
      console.log("ugh");
      LoginManager.logInWithReadPermissions(['public_profile', 'email'])
      .then((result) => {
        console.log('here');
        if (result.isCancelled) {
          console.log('The user cancelled the request');
          return Promise.reject(new Error('The user cancelled the request'));
        }
        // Retrieve the access token
        console.log("worked maybe");
        return AccessToken.getCurrentAccessToken();
      })
      .then((data) => {
        console.log('maaaaaaaaaaaaybe?');
        // Create a new Firebase credential with the token
        const credential = firebase.auth.FacebookAuthProvider.credential(data.accessToken);
        // Login with the credential
        console.log("cred");
        console.log(credential);
        return firebase.auth().signInWithCredential(credential);
      })
      .then((user) => {
        console.log('yaaay');
        console.log(user);
        // If you need to do anything with the user, do it here
        // The user will be logged in automatically by the
        // `onAuthStateChanged` listener we set up in App.js earlier
      })
      .catch((error) => {
        const { code, message } = error;
        // For details of error codes, see the docs
        // The message contains the default Firebase string
        // representation of the error
      });
    }


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
      // The application is initialising
/*      console.log('STATES');
      console.log(this.state.loading);
      console.log(this.state.user);
      console.log(this.state.user !== null && this.state.user !== undefined);

      if (this.state.loading) return (
        <Container>
        <Content>
          <Text>Loading</Text>
        </Content>
        </Container>
      );
      // The user exists, so they're logged in
      if (this.state.user !== null && this.state.user !== undefined) {
        this.props.navigation.navigate('Recipes');
      }*/
      // The user is null, so they're logged out
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

          <Card>
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
                  onChangeText={(text) => this.setState({email: text})}/>
              </Item>
            }
              { this.state.showStuff
                &&
              <Item floatingLabel>
                <Icon active name='md-lock' />
                <Label>Password</Label>
                <Input
                  type="password"
                  onChangeText={(text) => this.setState({password: text})}/>
              </Item>
            }

            { (this.state.showStuff && this.state.showSignUp)
              &&
              <Item floatingLabel>
                <Icon active name='md-lock' />
                <Label>Repeat Password</Label>
                <Input
                  type="password2"
                  onChangeText={(text) => this.setState({password2: text})}/>
              </Item>
            }
          </Card>

{(this.showStuff && !this.showSignUp)
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
                { (this.showStuff && this.showSignUp)
                  &&
                  <Button
                    onPress={this.register.bind(this)}
                    style={{...styles.signUpButton, ...styles.center}}>
                    <Body>
                      <Text
                        style={{...styles.signUpButtonText, ...styles.center}}>
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

        <Button
          onPress={() => firebase.auth().signOut().then((stuff) => console.log("eh" + stuff + "eh"))} >
          <Text>
          Sign out
          </Text>
        </Button>
*/

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
