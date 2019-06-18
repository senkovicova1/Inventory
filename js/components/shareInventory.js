import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import {  Card, Content, Header, Toast, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import { rebase } from '../../index';
import firebase from 'firebase';

import {textShareInventory} from '../helperFiles/dictionary';

import store from "../store/index";

import styles from '../style';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: 'lightgreen',
      justifyContent: 'center',
      alignItems: 'center',
    }}
    >
    <Text>Waiting</Text>
  </View>
);

export default class ShareInventory extends Component {

  constructor(props) {
    super(props);
    this.state = {
        key: this.props.navigation.getParam('key', 'NO-ID'),
        owners: this.props.navigation.getParam('owners', 'NO-ID'),
        users: {},
        searchedWord: "",
        message: "",
        showMessage: false,
    };

    this.handleBackPress.bind(this);
    this.addFriend.bind(this);
    this.removeInv.bind(this);
    this.toggleSearch.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
      rebase.fetch(`users`, {
        context: this,
        withIds: true,
      }).then((u) => {
        this.setState({
          users: u,
        });
      });
  }


  addFriend(key){
    let id = Date.now().toString(16).toUpperCase();
    let owners = {};
    owners[id] = key

    rebase.update(`inventories/${this.state.key}/owners`, { data: owners
    }).then((data) => {
        let newOwners = {...this.state.owners};
        newOwners[id] = key;
        this.setState({
          owners: newOwners,
        });
      }
    );
  }

  toggleSearch(){
  /*  this.setState({
      searchOpen: !this.state.searchOpen,
    });*/
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  handleBackPress = () => {
      return false;
  }

  onValueChange(value: string) {
    this.setState({
      searchedFriend: value
    });
  }

  removeInv(){
    let id = Date.now().toString(16).toUpperCase();
    let ownerIndex = Object.keys(this.state.owners).filter(key => this.state.owners[key] === store.getState().user.uid)[0];
    console.log(ownerIndex);

    rebase.remove(`inventories/${this.state.key}/owners/${ownerIndex}`)
    .then((data) => {
      this.setState({
        showMessage: true,
        message: textShareInventory.messageDel[store.getState().lang]
      });
        this.props.navigation.navigate("Recipes");
      }
    );
  }

  render() {
    const LANG = store.getState().lang;

    return (
        <Container>
            <Header style={{ ...styles.header}}>
                  <Left style={{...styles.centerVer, paddingRight: 0, zIndex: 100 }}>
                    <Button transparent onPress={() => this.props.navigation.goBack()}>
                      <Icon name="arrow-back" style={{ ...styles.headerItem }}/>
                    </Button>
                  </Left>
                  <Col xs={70}>
                    <Title style={{ ...styles.headerItem, ...styles.centerVer, marginLeft: -deviceWidth*0.50 }}>{textShareInventory.header[LANG]}</Title>
                  </Col>
            </Header>

            <Content style={{ ...styles.content }} >

              {this.state.showMessage
                &&
                Toast.show({
                  text: this.state.message,
                  duration: 2000,
                })
              }

              <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>

                  <Input
                    style={{ ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(0, 170, 160)'}}
                    placeholder={textShareInventory.search[LANG]}
                    placeholderTextColor='rgb(142, 210, 210)'
                    onChangeText={(text) => this.setState({searchedWord: text})}/>

                  <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
                      <List>
                      {
                        Object.keys(this.state.users).length > 0
                        &&
                        Object.keys(this.state.users)
                            .filter(key =>
                              this.state.users[key].username.toLowerCase().includes(this.state.searchedWord.toLowerCase())
                              &&
                              !Object.values(this.state.owners).includes(key)
                            ).map(key =>
                                <ListItem style={{ height: 40 }}>
                                  <Body >
                                      <Text style={{ ...styles.listText, color: 'rgb(0, 170, 160)' }}>
                                         {this.state.users[key].username}
                                      </Text>
                                  </Body>
                                  <Right>
                                      <Button transparent onPress={()=> this.addFriend(key)} >
                                        <Icon name='md-add' style={{ ...styles.minusIngredient }}/>
                                      </Button>
                                  </Right>
                                </ListItem>

                        )
                      }
                      </List>
                  </Card>
              </Card>

              <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>

                <Text onPress={() => this.setState({addNewFriends: true})} style={{marginLeft:15, color: 'rgb(0, 170, 160)', borderColor: 'rgb(0, 170, 160)' }}>
                  {textShareInventory.pplWAcc[LANG]}
                </Text>

                  <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
                      <List>
                      {
                        Object.keys(this.state.users).length > 0
                        &&
                        Object.keys(this.state.users)
                            .filter(key => Object.values(this.state.owners).includes(key))
                            .map(key =>
                                <ListItem style={{ height: 40 }}>
                                    <Text style={{ ...styles.listText, color: 'rgb(0, 170, 160)' }}>
                                       {(key === store.getState().user.uid ? (LANG === 0 ? "Vy" : "You") : this.state.users[key].username)}
                                    </Text>
                                </ListItem>

                        )
                      }
                      </List>
                  </Card>
              </Card>

              <Button  block danger style={{ ...styles.acordionButtonTrans, marginLeft: 15, marginRight: 15, marginBottom: 15}} onPress={()=> this.removeInv()}>
                  <Text style={{ ...styles.acordionButtonTextTrans }}>{textShareInventory.del[LANG]}</Text>
              </Button>

            </Content>
          </Container>
    );
  }
}
