import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, Content, Header, Toast, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

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
    this.handleShowRecipes.bind(this);
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

  handleShowRecipes(key){
    if (this.state.showRecipes !== null){
      this.setState({
        showRecipes: null,
        actualRecipes: [],
      });
    } else {
      let accGrantedRec = this.state.recipeAccess.filter(acc => acc.userID === key).map(acc => acc.recID);
      const actualRecipes = Object.keys(this.state.recipes).filter(key => accGrantedRec.includes(key));
      this.setState({
        showRecipes: key,
        actualRecipes: actualRecipes,
      });
    }
  }

  handleRequest(key){
    console.log("handling");
  /*  let id = Date.now().toString(16).toUpperCase();
    rebase.post(`users/${this.state.showRecipes}/notices/RR-${id}`, {
      data: {userID: this.state.showRecipes, recID: key, approved: false, seen: false}
    }).then(newLocation => {
        rebase.post(`users/${store.getState().user.uid}/notices/RRM-${id}`, {
          data: {recID: key, approved: false,}
        }).then((x) => {
          this.setState({
            message: "Recipe requested!",
            showMessage: true,
          });
        })
    });*/

  }

  handleGet(key){
    console.log("yay");
  }

/*componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    this.ref1 = rebase.syncState(`users`, {
      context: this,
      state: 'users',
    });
    this.ref2 = rebase.syncState(`recipes`, {
      context: this,
      state: 'recipes',
    });
    this.ref3 = rebase.syncState(`recipeAccess`, {
      context: this,
      state: 'recipeAccess',
      asArray: true,
    });
  }*/

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

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  render() {
    console.log(typeof this.state.searchedFriend);
    console.log(this.state.searchedFriend !== 0);
    return (

        <Container>
            <Header style={{ ...styles.header}}>
              <Left>
                <Button transparent onPress={() => this.props.navigation.goBack()}>
                  <Icon name="md-close" style={{ ...styles.headerItem }}/>
                </Button>
              </Left>
              <Body>
                <Title style={{ ...styles.headerItem }}>Get a recipe from a friend!</Title>
              </Body>
              <Button transparent onPress={() => {}} >
              </Button>
            </Header>

            <Content style={{ ...styles.content }} >

              {this.state.showUnsaved
                &&
                Toast.show({
                  text: `If you leave now, your changes will not be saved! If you wish to leave without saving your changes, press back button again.`,
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
                    Filter recipes by name
                  </Text>
                </Row>
                <Row>
                      <Input
                        autoFocus
                        style={{ ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(0, 170, 160)'}}
                        placeholder="Start typing here!"
                        placeholderTextColor='rgb(142, 210, 210)'
                        onChangeText={(text) => this.setState({searchedWord: text})}/>

                </Row>
                <Row>
                  <Text onPress={() => this.setState({addNewFriends: true})} style={{marginLeft:15, color: 'rgb(0, 170, 160)',  borderColor: 'rgb(0, 170, 160)' }}>
                    or filter recipes by friends!
                  </Text>
                </Row>
                <Row>
                    <Picker
                       mode="dropdown"
                       style={{ ...styles.picker }}
                       selectedValue={this.state.searchedFriend}
                       onValueChange={this.onValueChange.bind(this)}
                     >
                      <Picker.Item key={0} label={"All friends"} value={0}/>
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
                                      const COND1 = this.state.recipes[key].name.toLowerCase().includes(this.state.searchedWord.toLowerCase());
                                      if(this.state.searchedFriend !== 0){
                                        const COND2 = Object.values(this.state.recipes[key].owners).includes(this.state.searchedFriend);
                                        if (this.state.searchedWord.length > 0){
                                          return COND1 && COND2;
                                        }
                                        return COND2;
                                      }
                                      return COND1;
                                    }
                                  ).map(key =>
                                    <Grid  onPress={() => this.handleShowRecipes(key)}>
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
                                              <Text style={{ ...styles.acordionButtonVioText }}>Ask to share</Text>
                                            </Button>
                                        </Col>
                                        <Col xs={50}>
                                          <Button transparent full style={{ ...styles.acordionButtonVio}} onPress={()=> this.handleGet(key)} >
                                            <Text style={{ ...styles.acordionButtonVioText }}>Get!</Text>
                                          </Button>
                                        </Col>
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

/*
{ this.state.addNewFriends
  &&
    <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
      <Row>
        <Col size={80}>
          { this.state.searchOpenNew
          &&
            <Input
              autoFocus
              style={{ ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(0, 170, 160)'}}
              placeholder="Enter a username"
              placeholderTextColor='rgb(142, 210, 210)'
              onChangeText={(text) => this.setState({searchedNew: text})}/>
          }
          {!this.state.searchOpenNew
            &&
              <Button transparent>
                 <Text style={{  ...styles.stepsCardHeader, fontSize: 20, marginLeft:15, color: 'rgb(142, 210, 210)' }}>
                   Find new friends
                 </Text>
               </Button>

          }
        </Col>
        <Col size={20}>
          <Button transparent onPress={this.toggleSearch.bind(this)} >
            <Icon name="search" style={{ ...styles.stepsCardHeader, color: 'rgb(0, 170, 160)' }} />
          </Button>
        </Col>
      </Row>
      <Row>
        <Text onPress={() => this.setState({addNewFriends: false})} style={{marginLeft:15, color: 'rgb(0, 170, 160)', textDecorationLine: 'underline', borderColor: 'rgb(0, 170, 160)' }}>
          or go back to your friends
        </Text>
      </Row>
        <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
          {
            Object.keys(this.state.users).length > 0
            &&
            Object.keys(this.state.users).filter(key =>
                !Object.values(this.state.users[store.getState().user.uid].friends).includes(key)
                && key !== store.getState().user.uid
                && this.state.users[key].username.toLowerCase().includes(this.state.searchedNew.toLowerCase())
            ).map(key =>
              <ListItem button  style={{...styles.listItem}} noBorder  onPress={() => this.setState({showRecipes: key})}>
                  <Left>
                      <Thumbnail
                      style={styles.stretch}
                      source={require('../helperFiles/sushi.jpg')}
                      />
                       <Text style={{ ...styles.listText, color: 'rgb(0, 170, 160)' }}>
                         {this.state.users[key].username}
                       </Text>
                  </Left>
                  <Right>
                    <Button transparent onPress={() => this.addFriend(key)}>
                      <Icon name="md-add" style={{ ...styles.stepsCardHeader, color: 'rgb(0, 170, 160)' }} />
                    </Button>
                  </Right>
              </ListItem>
            )
          }
        </Card>
    </Card>
  }

  { (!this.state.addNewFriends && this.state.showRecipes === null)
    &&
      <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
        <Row>
          <Col size={80}>
            { this.state.searchOpenFriend
            &&
              <Input
                autoFocus
                style={{ ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(0, 170, 160)'}}
                placeholder="Enter friend's username"
                placeholderTextColor='rgb(142, 210, 210)'
                onChangeText={(text) => this.setState({searchedFriend: text})}/>
            }
            {!this.state.searchOpenFriend
              &&
                <Button transparent>
                   <Text style={{  ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(142, 210, 210)' }}>
                     Search friends
                   </Text>
                 </Button>

            }
          </Col>
          <Col size={20}>
            <Button transparent onPress={(text) => this.setState({searchOpenFriend: !this.state.searchOpenFriend})} >
              <Icon name="search" style={{ ...styles.stepsCardHeader, color: 'rgb(0, 170, 160)' }} />
            </Button>
          </Col>
        </Row>
        <Row>
          <Text onPress={() => this.setState({addNewFriends: true})} style={{marginLeft:15, color: 'rgb(0, 170, 160)', textDecorationLine: 'underline', borderColor: 'rgb(0, 170, 160)' }}>
            or add a new friend
          </Text>
        </Row>
          <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
            {
              Object.keys(this.state.users).length > 0
              &&
              Object.values(this.state.users[store.getState().user.uid].friends)
              .filter(key =>
                  this.state.users[key].username.toLowerCase().includes(this.state.searchedFriend.toLowerCase())
              ).map(key =>
                <ListItem button  style={{...styles.listItem}} noBorder  onPress={() => this.handleShowRecipes(key)}>
                  <Left>
                      <Thumbnail
                      style={styles.stretch}
                      source={require('../helperFiles/sushi.jpg')}
                      />
                       <Text style={{ ...styles.listText, color: 'rgb(0, 170, 160)' }}>
                         {this.state.users[key].username + "'s recipes"}
                       </Text>
                  </Left>
                </ListItem>
              )
            }
          </Card>
      </Card>
    }

    { this.state.showRecipes !== null
      &&
        <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
          <Row>
            <Col size={80}>
              { this.state.searchOpenRec
              &&
                <Input
                  autoFocus
                  style={{ ...styles.stepsCardHeader, marginLeft:15, color: 'rgb(0, 170, 160)'}}
                  placeholder="Enter name of the recipe"
                  placeholderTextColor='rgb(142, 210, 210)'
                  onChangeText={(text) => this.setState({searchedRec: text})}/>
              }
              {!this.state.searchOpenRec
                &&
                  <Button transparent>
                     <Text style={{  ...styles.stepsCardHeader, fontSize: 15, marginLeft:15, color: 'rgb(142, 210, 210)' }}>
                       {`Search in ${this.state.users[this.state.showRecipes].username}' recipes `}
                     </Text>
                   </Button>

              }
            </Col>
            <Col size={20}>
              <Button transparent onPress={(text) => this.setState({searchOpenRec: !this.state.searchOpenRec})} >
                <Icon name="search" style={{ ...styles.stepsCardHeader, color: 'rgb(0, 170, 160)' }} />
              </Button>
            </Col>
          </Row>
          <Row>
            <Text onPress={() => this.setState({showRecipes: null})} style={{marginLeft:15, color: 'rgb(0, 170, 160)', textDecorationLine: 'underline', borderColor: 'rgb(0, 170, 160)' }}>
              or choose another friend
            </Text>
          </Row>
            <Card transparent style={{ ...styles.formCard, backgroundColor: 'rgba(142, 210, 210, 0.5)'}}>
              {
                this.state.actualRecipes.length > 0
                &&
                this.state.actualRecipes
                .filter(key =>
                    this.state.recipes[key].name.toLowerCase().includes(this.state.searchedRec.toLowerCase())
                ).map(key =>
                  <Grid>
                    <Row  style={{...styles.listItem, height: deviceHeight*0.07}}>
                        <Col size={60}>
                         <Text style={{ ...styles.listText, color: 'rgb(0, 170, 160)' }}>
                           {this.state.recipes[key].name}
                         </Text>
                       </Col>
                       <Col size={40}>
                          <Button style={{ ...styles.listTextBadge, height: 25 }} onPress={() => this.handleRequest(key)}>
                            <Text style={{ ...styles.listTextBadgeText }}> Request </Text>
                         </Button>
                       </Col>
                   </Row>
                   {this.state.recipes[key].image
                     &&
                   <Row style={{...styles.listItem}}>
                     <Image
                       style={{ ...styles.image, width: deviceWidth*0.75, ...styles.center }}
                       source={{uri: this.state.recipes[key].image}}
                       />
                   </Row>
                 }

                  </Grid>
                )
              }
            </Card>
        </Card>
      }

*/
