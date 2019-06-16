import React, { Component } from 'react';
import {Image, Platform, Dimensions} from 'react-native';
import { Container, Drawer, Toast, Header, View, Title, Card, Content, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Row, Badge, Form, Label, Input, Item } from 'native-base';

import Sidebar from './sidebar';

import store from "../store/index";
import { logUser, logOffUser, setLang } from "../actions/index";

import {textSettings} from '../helperFiles/dictionary';

import firebase from 'firebase';
import { rebase } from '../../index';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

//import { GoogleSignin, GoogleSigninButton } from 'react-native-google-signin';
import styles from '../style';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;


export default class Settings extends Component {

  constructor(props) {
    super(props);
    this.state = {
      lang: 1,
      user: {},
      newUsername: "",
      showMessage: false
    }
    this.signOut.bind(this);
    this.changeLang.bind(this);
    this.fetch.bind(this);
    this.fetch(store.getState().user.uid);
  }

    fetch(id){
      rebase.fetch(`users/${id}`, {
        context: this,
        withIds: true,
      }).then((r) => {
        this.setState({
          user: r,
        });
      });
    }

  changeLang(lang){
    store.dispatch(setLang({lang: lang}));
    rebase.update(`users/${store.getState().user.uid}`, {
      data: {lang: lang}
    }).then(data => {
      this.setState({
        lang: (lang === "sk" ? 0 : 1),
      });
    })
  }

  changeName(){
    rebase.update(`users/${store.getState().user.uid}`, {
      data: {username: this.state.newUsername}
    }).then(data => {
      this.setState({
        user: {...this.state.user, username: this.state.newUsername},
        newUsername: "",
        showMessage: true,
      });
    })
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
    const LANG = store.getState().lang;

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
                <Title style={{ ...styles.headerItem }}> {textSettings.header[LANG]}</Title>
            </Body>
          </Header>

          <Content style={styles.content}>

          <Card transparent style={{ ...styles.listCard, padding: 10 }}>

            <Grid>
              <Row>
                <Text style={{ ...styles.acordionButtonText, marginLeft: 5, fontSize: 20 }}>{textSettings.lang[LANG]}</Text>
              </Row>
              <Row style={{ marginBottom: 20 }}>
                <Col size={50}>
                  <Button
                    transparent
                    full
                    style={(LANG === 0 ? { ...styles.acordionButton} : { ...styles.acordionButtonTrans})}
                    bordered={(LANG === 0 ? false : true)}
                    warning={(LANG === 0 ? false : true)}
                    onPress={()=> this.changeLang("sk")} >
                    <Text style={(LANG === 0 ? { ...styles.acordionButtonText} : { ...styles.acordionButtonTextTrans})}>SK</Text>
                  </Button>
               </Col>
               <Col size={50}>
                  <Button
                    transparent
                    full
                    style={(LANG === 1 ? { ...styles.acordionButton} : { ...styles.acordionButtonTrans})}
                    bordered={(LANG === 1 ? false : true)}
                    warning={(LANG === 1 ? false : true)}
                    onPress={()=> this.changeLang("eng")} >
                    <Text style={(LANG === 1 ? { ...styles.acordionButtonText} : { ...styles.acordionButtonTextTrans})}>ENG</Text>
                  </Button>
               </Col>
              </Row>

              <Row>
                <Text style={{ ...styles.acordionButtonText, marginLeft: 5, fontSize: 20 }}>{textSettings.username[LANG]}</Text>
              </Row>
              <Row style={{ marginBottom: 20 }}>
                <Col size={85}>
                <Input
                  style={{ ...styles.formTitle, borderRadius: 8 }}
                  value={this.state.newUsername.length > 0 ? this.state.newUsername : this.state.user.username}
                  placeholder="Your name"
                  placeholderTextColor='rgb(255, 184, 95)'
                  onChangeText={(text) => this.setState({newUsername: text})}/>
                </Col>
                <Col size={15}>
                  <Button
                    transparent
                    full
                    style={{ ...styles.centerVer, padding: 0}}
                    onPress={()=> this.changeName()} >
                    <Icon name="md-checkmark"  style={{ ...styles.acordionButtonText }}/>
                  </Button>
                </Col>
              </Row>

              {this.state.showMessage
                &&
                Toast.show({
                  text: store.getState().lang === 0 ? "Meno zmenené." : "You name has been changed.",
                  duration: 2000,
                  type: "success",
                  onClose: () => this.setState({showMessage: false,})
                })
              }

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
                    style={{...styles.logInOutButton, ...styles.center, width: deviceWidth*0.9}}
                    full
                    >
                      <Text style={{...styles.logInOutButtonText, ...styles.center}}>
                        {textSettings.out[LANG]}
                      </Text>
                  </Button>
                }
          </Grid>

          </Card>

          </Content>
          </Container>
        </Drawer>
      );
    }
}
