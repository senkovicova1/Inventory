import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, Content, Header, Toast, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

import {textGetRecipe} from '../helperFiles/dictionary';

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

export default class AddRecipeBarcode extends Component {

  constructor(props) {
    super(props);
    this.state = {
        users: {},
        recipes: {},

        searchOpenNew: false,
        addNewFriends: false,
        searchedNew: "",

        searchOpenFriend: false,
        searchFriends: true,

        searchedWord: "",
        searchedFriend: "",

        searchOpenRec: false,
        searchRec: true,
        searchedRec: "",

        showRecipes: null,
        showUnsaved: false,
        changed: false,

        message: "",
        showMessage: false,
    };

    this.onValueChange.bind(this);
    this.handleGet.bind(this);
    this.handleRequest.bind(this);
    this.handleBackPress.bind(this);
    this.addFriend.bind(this);
    this.submit.bind(this);
    this.toggleSearch.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    rebase.fetch(`recipes`, {
      context: this,
      withIds: true,
    }).then((rec) => {
      rebase.fetch(`users`, {
        context: this,
        withIds: true,
      }).then((u) => {
        this.setState({
          recipes: rec,
          users: u,
        });
      });
  });
  }

  submit(){
    this.props.navigation.push('Recipes');
  }

  addFriend(key){
    let id = Date.now().toString(16).toUpperCase();
    let newFriends = { ...this.state.users[store.getState().user.uid].friends};
    newFriends[id] = key;
    let newUsers = {...this.state.users};
    newUsers[store.getState().user.uid].friends = newFriends
    this.setState({
      users: newUsers,
      addNewFriends: false,
    })
  }

  toggleSearch(){
    this.setState({
      searchOpen: !this.state.searchOpen,
    });
  }

  handleRequest(key){
//    console.log("handling");
    let id = Date.now().toString(16).toUpperCase();
    let wantedRecipe = Object.keys(this.state.recipes).filter(id => id === key).map(id =>  this.state.recipes[id])[0];

    rebase.post(`users/${store.getState().user.uid}/notices/RRM-${id}`, {
      data: {recID: key, approved: false}
    }).then((x) => {
      Object.values(wantedRecipe.owners).map(owner =>
        rebase.post(`users/${owner}/notices/RR-${id}`, {
          data: {userID: store.getState().user.uid, recID: key, approved: false, seen: false}
        }).then(newLocation => {
          this.setState({
            message: textGetRecipe.messageShare[store.getState().lang],
            showMessage: true,
          });
        })
      );
    });
  }

  handleGet(key){
    let id = Date.now().toString(16).toUpperCase();
    let wantedRecipe = Object.keys(this.state.recipes).filter(id => id === key).map(id =>  this.state.recipes[id])[0];
    let newOwners = {...wantedRecipe.owners};
    newOwners[id] = store.getState().user.uid;
    let own = {};
    own[id] = store.getState().user.uid;
    let recipe = {
      name: wantedRecipe.name,
      body: wantedRecipe.body,
      image: wantedRecipe.image,
      ingredients: {...wantedRecipe.ingredients},
      owners: own
    };
    rebase.post(`recipes/${id}`, {
      data: recipe
    }).then((x) =>
      this.setState({
          message: textGetRecipe.messageGet[store.getState().lang],
          showMessage: true,
      })
    );
  }

componentWillUnmount() {
  BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
}

  handleBackPress = () => {
    if (this.state.changed && !this.state.showUnsaved){
      this.setState({
        showUnsaved: true
      });
      return true;
    } else if (this.state.showUnsaved || !this.state.changed){
      return false;
    }
  }

  onValueChange(value: string) {
    this.setState({
      searchedFriend: value
    });
  }

  render() {
    const LANG = store.getState().lang;

    return (
        <Container>
            <Header style={{ ...styles.header}}>
              <Left>
                <Button transparent onPress={() => this.props.navigation.goBack()}>
                  <Icon name="md-close" style={{ ...styles.headerItem }}/>
                </Button>
              </Left>
              <Body>
                <Title style={{ ...styles.headerItem }}>{textGetRecipe.header[LANG]}</Title>
              </Body>
              <Button transparent onPress={() => {}} >
              </Button>
            </Header>

            <Content style={{ ...styles.content }} >

              {this.state.showUnsaved
                &&
                Toast.show({
                  text: textGetRecipe.messageGet[LANG],
                  duration: 4000,
                  type: 'danger'
                })
              }

              {this.state.showMessage
                &&
                Toast.show({
                  text: this.state.message,
                  duration: 2000,
                })
              }

              <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
                <Row>
                  <Text onPress={() => this.setState({addNewFriends: true})} style={{marginLeft:15, color: 'rgb(0, 170, 160)', borderColor: 'rgb(0, 170, 160)' }}>
                    {textGetRecipe.filterName[LANG]}
                  </Text>
                </Row>
                <Row>
                      <Input
                        autoFocus
                        style={{ ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(0, 170, 160)'}}
                        placeholder={textGetRecipe.filterInput[LANG]}
                        placeholderTextColor='rgb(142, 210, 210)'
                        onChangeText={(text) => this.setState({searchedWord: text})}/>

                </Row>
                <Row>
                  <Text onPress={() => this.setState({addNewFriends: true})} style={{marginLeft:15, color: 'rgb(0, 170, 160)',  borderColor: 'rgb(0, 170, 160)' }}>
                    {textGetRecipe.filterUsers[LANG]}
                  </Text>
                </Row>
                <Row>
                    <Picker
                       mode="dropdown"
                       style={{ ...styles.picker }}
                       selectedValue={this.state.searchedFriend}
                       onValueChange={this.onValueChange.bind(this)}
                     >
                      <Picker.Item key={0} label={textGetRecipe.filterPicker[LANG]} value={0}/>
                       { Object.keys(this.state.users)
                         .map(i =>
                                <Picker.Item key={i} label={this.state.users[i].username} value={i}/>
                              )
                       }
                     </Picker>
                </Row>
                  <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
                    {
                      this.state.users
                      &&
                      Object.keys(this.state.users).length > 0
                      &&
                      this.state.recipes
                      &&
                      Object.keys(this.state.recipes).length > 0
                      &&
                      Object.keys(this.state.recipes)
                                  .filter(key => {
                                    const COND4 = !this.state.recipes[key].owners;
                                      const COND1 = this.state.recipes[key].name.toLowerCase().includes(this.state.searchedWord.toLowerCase());
                                      const COND3 = this.state.recipes[key].owners && !Object.values(this.state.recipes[key].owners).includes(store.getState().user.uid);
                                      if(this.state.searchedFriend !== 0){
                                        const COND2 = this.state.recipes[key].owners && Object.values(this.state.recipes[key].owners).includes(this.state.searchedFriend);
                                        if (this.state.searchedWord.length > 0){
                                          return (COND1 && COND2 && COND3) || COND4;
                                        }
                                        return (COND2 && COND3) || COND4;
                                      }
                                      return (COND1 && COND3) || COND4;
                                    }
                                  ).map(key =>
                                    <Grid>
                                      <Row>
                                            <Thumbnail
                                            style={styles.stretch}
                                            source={{uri: this.state.recipes[key].image}}
                                            />
                                             <Text style={{ ...styles.listText, color: 'rgb(0, 170, 160)' }}>
                                                 {this.state.recipes[key].name}
                                              </Text>
                                      </Row>
                                      <Row>
                                        <Col xs={50}>
                                            <Button transparent full style={{ ...styles.acordionButtonVio}} onPress={()=> this.handleRequest(key)} >
                                              <Text style={{ ...styles.acordionButtonVioText }}>{textGetRecipe.share[LANG]}</Text>
                                            </Button>
                                        </Col>
                                        <Col xs={50}>
                                          <Button transparent full style={{ ...styles.acordionButtonVio}} onPress={()=> this.handleGet(key)} >
                                            <Text style={{ ...styles.acordionButtonVioText }}>{textGetRecipe.get[LANG]}</Text>
                                          </Button>
                                        </Col>
                                      </Row>
                                      <Row style={{ height: 20}}>
                                      </Row>
                                    </Grid>
                      )
                    }
                  </Card>
              </Card>

            </Content>
          </Container>
    );
  }
}
