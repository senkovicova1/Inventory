import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer,  Card, Content, Header, Body, Title, Text, List, Input, Item, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, Col, Row, Grid, StyleProvider, getTheme, variables } from 'native-base';
import Modal from "react-native-modal";
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

import store from "../store/index";

import styles from '../style';


const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;


export default class ListRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedInventory: "",

      searchOpen: false,
      searchedWord: '',
      addOpen: false,

      recipes: [],
      inventories: [],
      users: [],

      text: "nothing now",
    };

    this.handleBackPress.bind(this);
    this.toggleSearch.bind(this);
    this.toggleAdd.bind(this);
    this.onValueChange.bind(this);
    this.addItem.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    const USER_ID = store.getState().user.uid;

      rebase.fetch(`inventories`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((inv) => {
        rebase.fetch(`users`, {
          context: this,
          withIds: true,
          asArray: true
        }).then((u) => {
          this.setState({
            inventories: inv.filter(inventory => inventory.owners.includes(store.getState().user.uid)),
            users: u,
          });
        });
    });
  }

    addItem(newItem){
      this.setState({
        recipes: this.state.recipes.concat([newItem]) //updates Firebase and the local state
      });
    }

    toggleSearch(){
      this.setState({
        searchOpen: !this.state.searchOpen,
      });
    }

    onValueChange(value: string) {
      this.setState({
        selected: value
      });
    }

    toggleAdd(){
      this.setState({
        addOpen: !this.state.addOpen,
      });
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

        rebase.bindToState(`recipes`, {
         context: this,
         state: 'recipes',
        });

        rebase.bindToState(`users/${store.getState().user.uid}/notices`, {
         context: this,
         state: 'notices',
         asArray: true,
         then: function(notices){
           this.setState({
             modalVisible: (this.state.notices.filter(note => !note.seen).length > 0),
           });
         }
       });

    }

      componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
      }

      toggleModal(visible) {
      /*    rebase.update(`users/${this.state.showRecipes}/notices/RR-${id}`, {
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
          this.setState({modalVisible: visible});
      }

      approveRequest(note){
      //  console.log("approving");
        rebase.update(`users/${store.getState().user.uid}/notices/${note.key}`, {
          data: {approved: true, seen: true}
        }).then(newLocation => {
            rebase.update(`users/${note.userId}/notices/${note.key}`, {
              data: {approved: true,}
            }).then((x) => {
              let id = Date.now().toString(16).toUpperCase();
          //    let wantedRecipe = this.state.recipes.filter(rec => rec.key === note.recId)[0];
              let wantedRecipe = Object.keys(this.state.recipes).filter(id => id === note.recId).map(id =>  this.state.recipes[id])[0];
                let newOwners = {...wantedRecipe.owners};
                newOwners[id] = note.userId;
                  rebase.update(`recipes/${note.recId}`, {
                    data: {owners: newOwners}
                  });
            })
        });
      }

      declineRequest(note){
            rebase.update(`users/${store.getState().user.uid}/notices/RR-${note.key}`, {
              data: {approved: false, seen: true}
            }).then(newLocation => {
                rebase.update(`users/${note.userId}/notices/RRM-${note.key}`, {
                  data: {approved: false,}
                }).then((x) => {
                  let id = Date.now().toString(16).toUpperCase();
                  let wantedRecipe = this.state.recipes.filter(rec => rec.key === note.recId)[0];
                    let newOwners = {};
                    newOwners[id] = note.userId;
                      rebase.post(`recipes/${id}`, {
                        data: {name: wantedRecipe.name, body: wantedRecipe.body, ingredients: wantedRecipe.ingredients, image: wantedRecipe.image, owners: newOwners}
                      });
                })
            });
      }

      handleBackPress = () => {
        if (this.state.modalVisible){
          this.setState({
            modalVisible: false,
          });
        }
        this.props.navigation.navigate("Recipes");
        return true;
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

               <Body >
                 { this.state.searchOpen
                 &&
                   <Input
                     autoFocus
                     style={{ ...styles.headerItem}}
                     placeholder="zadajte hľadaný výraz"
                     placeholderTextColor='rgb(0, 170, 160)'
                     onChangeText={(text) => this.setState({searchedWord: text})}/>
                 }
                 {!this.state.searchOpen
                   &&
                     <Title style={{ ...styles.headerItem }}> Recepty</Title>
                 }
               </Body>

               <Button transparent onPress={this.toggleSearch.bind(this)} >
                   <Icon name="search" style={{ ...styles.headerItem }} />
               </Button>

           </Header>

         <Content padder style={{ ...styles.content }} >

{(this.state.notices
  &&
  this.state.notices.length > 0
  &&
  this.state.users
  &&
  this.state.users.length > 0
  &&
  this.state.notices.filter(note => !note.seen && note.key.includes("RR-")).length > 0)
  &&

  <Modal
    style={{ ...styles.listCard, backgroundColor: 'rgb(124, 90, 150)', width: deviceWidth*0.8, marginTop: deviceHeight*0.2, marginBottom: deviceHeight*0.2, alignSelf: 'center' }}
    isVisible={this.state.modalVisible}
    backdropOpacity={0.4}
    onBackButtonPress={() => this.toggleModal(false)}
    onBackdropPress={() => this.toggleModal(false)}>

      <Text style={{ ...styles.listText, color: 'rgb(255, 184, 95)', height: deviceHeight*0.07 }}> You have new messages!</Text>
      {
        this.state.notices
          .filter(note => !note.seen && note.key.includes("RR-"))
          .map(note =>
            { console.log(this.state.users);
              let user = this.state.users.filter(user => user.key === note.userId)[0];
              let recipe = Object.keys(this.state.recipes).filter(key => key === note.recId).map(key => this.state.recipes[key])[0];
              console.log("HERE");
              console.log(recipe);
             return(
               <Grid style={{ borderRadius: 15, backgroundColor: 'rgb(104, 70, 130)', width: deviceWidth*0.76, alignSelf: 'center' }}>
                  <Text style={{ ...styles.listText }}>
                    {`${user.username} requested to share this recipe with you:`}
                  </Text>
                  <Image
                    style={{ ...styles.image, ...styles.center, width: deviceWidth*0.7 }}
                    source={{uri: recipe.image}}
                    />
                  <Row style={{ height: deviceHeight*0.05,  }}>
                    <Text style={{ ...styles.listText }}>{recipe.name}</Text>
                </Row>
                <Row style={{ height: deviceHeight*0.05}}>
                  <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.declineRequest(note)} >
                      <Text style={{ ...styles.acordionButtonText }}>Decline</Text>
                    </Button>
                  </Col>
                  <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.approveRequest(note)} >
                      <Text style={{ ...styles.acordionButtonText }}>Accept</Text>
                    </Button>
                 </Col>
                </Row>
              </Grid>
            )}
          )
        }
    </Modal>
  }

           <Card transparent style={{ ...styles.listCardInv }}>
             <Text style={{ ...styles.listCardInvText, marginLeft:15 }}>Varí sa z inventára </Text>
             <Picker
                mode="dropdown"
                style={{ ...styles.picker }}
                selectedValue={this.state.selected}
                onValueChange={this.onValueChange.bind(this)}
              >
                { this.state.inventories
                  .map(i =>
                         <Picker.Item key={i.key} label={i.name} value={i.key}/>
                       )
                }
              </Picker>
           </Card>

           {!this.state.addOpen
             &&
            <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.toggleAdd()} >
              <Icon name="md-add" style={{ ...styles.acordionButtonText }}/>
            </Button>
            }
            {this.state.addOpen
              &&
              <Button bordered full warning style={{ ...styles.acordionButtonTrans}} onPress={()=> this.toggleAdd()} >
                <Icon name="md-add" style={{ ...styles.acordionButtonText }}/>
              </Button>
            }
            {this.state.addOpen
              &&

              <Grid>
                <Row>
                  <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddRecipeBarcode')} >
                      <Text style={{ ...styles.acordionButtonText }}>Get from friend</Text>
                    </Button>
                 </Col>
                 <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddRecipeCreate')} >
                      <Text style={{ ...styles.acordionButtonText }}>Create new</Text>
                    </Button>
                 </Col>
              </Row>
              </Grid>
            }

            <Card transparent style={{ ...styles.listCard }}>
               <List
                 dataArray={
                   Object.keys(this.state.recipes)
                   .filter(key => this.state.recipes[key].owners
                                  && Object.values(this.state.recipes[key].owners).includes(store.getState().user.uid)
                                  && this.state.recipes[key].name.toLowerCase().includes(this.state.searchedWord.toLowerCase()))
                   .map(key => {
                     let item = {...this.state.recipes[key], key};
                     return item;
                   })}
                 renderRow={data =>
                   <ListItem button style={{...styles.listItem}} noBorder onPress={() => this.props.navigation.navigate('Recipe', {key: data.key}) }>
                     <Left>
                       <Thumbnail
                         style={{ ...styles.stretch }}
                         source={{uri: data.image}}
                       />
                     <Text style={{ ...styles.listText }}>{data.name}</Text></Left>
                     <Right>
                         <Badge style={{ ...styles.listTextBadge }}>
                           <Text style={{ ...styles.listTextBadgeText }}> </Text>

                       { /*   <Text style={{ color: ACC_CREAM }}>{data.id} {data.id == 1 ? "porcia" : (data.id <= 4? "porcie" : "porcií")}</Text>*/}
                      </Badge>
                     </Right>
                   </ListItem>
                 }
               />
           </Card>

         </Content>
       </Container>
      </Drawer>

    );
  }
}
