import React, { Component } from 'react';
import {Image, Platform} from 'react-native';
import { Container, Drawer, Header, View, Title, Card, Content, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';

import Sidebar from './sidebar';

import store from "../store/index";
import { logUser, logOffUser } from "../actions/index";

import firebase from 'firebase';
import { rebase } from '../../index';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

//import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';

import styles from '../style';

export default class Settings extends Component {

  constructor(props) {
    super(props);
    this.signOut.bind(this);
  }


  signOut(){
    firebase.auth().signOut();
    store.dispatch(logOffUser(null));
    this.props.navigation.push('Login');
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
          content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
          onClose={() => this.closeDrawer()} >

        <Container>
          <Header style={{ ...styles.header }}>
            <Left>
              <Button transparent  onPress={() => this.openDrawer()}>
                <Icon name="menu" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Body>
                <Title style={{ ...styles.headerItem }}> Settings</Title>
            </Body>
          </Header>

          <Content style={styles.content}>

            {(store.getState().user.providerData[0].providerId === 'facebook.com')
              &&
              <View style={{ alignSelf: 'center'}}>
              <LoginButton
                readPermissions={['public_profile', 'email']}
                onLoginFinished={
                  (error, result) => {
                    console.log("um..");
                  }
                }
                onLogoutFinished={() => this.signOut()}/>
            </ View>
            }
            {(store.getState().user.providerData[0].providerId !== 'facebook.com')
              &&
              <Button
                onPress={() => this.signOut()}
                styles={{...styles.signUpButton, ...styles.center}}>
                <Text style={{...styles.logInOutButtonText, ...styles.center}}>
                Sign out
                </Text>
              </Button>
            }

          </Content>
          </Container>
        </Drawer>
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
