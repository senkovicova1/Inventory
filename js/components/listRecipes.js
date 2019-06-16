import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer,  Card, Content, Header, Body, Title, Text, List, Input, Item, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, Col, Row, Grid, StyleProvider, getTheme, variables } from 'native-base';
import Modal from "react-native-modal";
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

import {unitToBasic} from '../helperFiles/helperFunctions';
import {textListRecipes} from '../helperFiles/dictionary';

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

      recipes: null, //{}
      foodInInventory: null, //{}
      inventories: null,  //[]
      users: [],
      notices: [],

      text: "nothing now",
    };

    this.calculationPossible.bind(this);
    this.calculatePortions.bind(this);
    this.getPortions.bind(this);
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
      rebase.fetch(`users`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((u) => {
        this.setState({
          users: u,
        });
      });
  }

  componentDidMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

    rebase.bindToState(`recipes`, {
      context: this,
      state: 'recipes',
      then: function(rec){
        if (this.calculationPossible()){
          this.calculatePortions();
        }
      }
    });

    rebase.bindToState(`inventories`, {
      context: this,
      state: 'inventories',
      asArray: true,
      then: function(inv){
        if (this.calculationPossible()){
          this.calculatePortions();
        }
      }
    });

    rebase.bindToState(`foodInInventory`, {
      context: this,
      state: 'foodInInventory',
      then: function(rec){
        if (this.calculationPossible()){
          this.calculatePortions();
        }
      }
    });

    rebase.bindToState(`users/${store.getState().user.uid}/notices`, {
      context: this,
      state: 'notices',
      asArray: true,
      then: function(notices){
        this.setState({
          modalVisible: (this.state.notices && this.state.notices.length > 0 && this.state.notices.filter(note => !note.seen).length > 0),
        });
      }
    });

  }

/*  componentWillReceiveProps(props){
    if (props.navigation.getParam('id', 'NO-ID') !== this.state.key){
      rebase.removeBinding(this.ref1);
      this.ref1 = rebase.bindToState(`foodInInventory/${props.navigation.getParam('id', 'NO-ID')}`, {
        context: this,
        state: 'foodInInventory',
        withIds: true,
      });

      this.setState({
        name: props.navigation.getParam('title', 'NO-ID'),
        notes: props.navigation.getParam('notes', 'NO-ID'),
        key: props.navigation.getParam('id', 'NO-ID'),
        owners: props.navigation.getParam('owners', 'NO-ID'),

        editTitle: false,
        editNotes: false,

        showID: false,

        searchOpen: false,
        searchedWord: '',
      });
    }
  }*/

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

    addItem(newItem){
      this.setState({
        recipes: this.state.recipes.concat([newItem])
      });
    }

    toggleSearch(){
      this.setState({
        searchOpen: !this.state.searchOpen,
      });
    }

    onValueChange(e: string) {
      console.log("picker value");
      console.log(e);
      this.setState({
        selectedInventory: e
      }, () => {
        this.calculatePortions()
      });
    }

    toggleAdd(){
      this.setState({
        addOpen: !this.state.addOpen,
      });
    }

      calculationPossible(){
        if (!this.state.selectedInventory && this.state.inventories) {
          this.setState({
            selectedInventory: this.state.inventories.filter(inventory => Object.values(inventory.owners).includes(store.getState().user.uid))[0].key
          }, () => {
            let cond1 = this.state.recipes && Object.keys(this.state.recipes).length > 0;
            let cond2 = this.state.foodInInventory && Object.keys(this.state.foodInInventory).length > 0;
            let cond3 = this.state.inventories && this.state.inventories.filter(inventory => Object.values(inventory.owners).includes(store.getState().user.uid)).length > 0;
            return cond1 && cond2 && cond3;
          });
        } else {
          let cond1 = this.state.recipes && Object.keys(this.state.recipes).length > 0;
          let cond2 = this.state.foodInInventory && Object.keys(this.state.foodInInventory).length > 0;
          let cond3 = this.state.inventories && this.state.inventories.filter(inventory => Object.values(inventory.owners).includes(store.getState().user.uid)).length > 0;
          return cond1 && cond2 && cond3;
        }
      }

      calculatePortions(){
        let newRecipes = {};
        Object.keys(this.state.recipes).map(key => {
          newRecipes[key] = {...this.state.recipes[key], portions: this.getPortions(key)}
        });
        this.setState({
          recipes: newRecipes,
        });
      }

      getPortions(recId){
        let food = this.state.foodInInventory[this.state.selectedInventory];
        if (!food){
          return 25;
        }
        let recipeIngredients = this.state.recipes[Object.keys(this.state.recipes).filter(key => key === recId)[0]].ingredients;
        if (!recipeIngredients){
          return -1; //recept nema ingrediencie
        }

        let amount = Infinity;
        Object.keys(recipeIngredients).map(ingKey => {
          if (amount < 0){  //nejaka predchadzajuca ing v inv nebola (-2) alebo jej bolo menej ako v inv (-2) alebo nemaju porovnatelne jednotky (-1)
            return;
          }

          let arr1 = recipeIngredients[ingKey].split(" ");

          if (arr1[0] === "-" || arr1[0] === "--"){
            return;
          }

          let ingExists = food[ingKey];
          if (!ingExists){
            amount = -2;  //ing v inv nie je
            return;
          }

          let amount1 = unitToBasic(arr1[0], arr1[1]);
          let unit1 = arr1[1];

          let arr2 = ingExists.split(" ");
          let amount2 = unitToBasic(arr2[0], arr2[1]);
          let unit2 = arr2[1];


          if (["g", "kg", "dkg"].includes(unit1) && ["g", "kg", "dkg"].includes(unit2)){
              unit1 = "g";
              unit2 = "g";

          } else if (["ml", "dcl", "l"].includes(unit1) && ["ml", "dcl", "l"].includes(unit2)){
              unit1 = "ml";
              unit2 = "ml";

          } else if (["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit1) && ["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit2)){
              unit1 = "tsp";
              unit2 = "tsp";

          } else if (!(["pcs", "ks"].includes(unit1) && ["pcs", "ks"].includes(unit2))) {
            amount = -1; //neporovnatelne jednotky
            return;
          }

          if (amount1 > amount2){
            amount = -2; //neda sa uvarit z takehoto mnozstva
            return;
          }

          let times = Math.floor(amount2/amount1);
          if (times < amount){
            amount = times;
          }
        });

        return amount;

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
        rebase.update(`users/${store.getState().user.uid}/notices/${note.key}`, {
          data: {approved: true, seen: true}
        }).then(newLocation => {
            rebase.update(`users/${note.userID}/notices/${note.key}`, {
              data: {approved: true,}
            }).then((x) => {
              let id = Date.now().toString(16).toUpperCase();
              let wantedRecipe = Object.keys(this.state.recipes).filter(id => id === note.recID).map(id =>  this.state.recipes[id])[0];
                let newOwners = {...wantedRecipe.owners};
                newOwners[id] = note.userID;
                  rebase.update(`recipes/${note.recID}`, {
                    data: {owners: newOwners}
                  });
            })
        });
      }

      declineRequest(note){
            rebase.update(`users/${store.getState().user.uid}/notices/${note.key}`, {
              data: {approved: false, seen: true}
            }).then(newLocation => {
                rebase.update(`users/${note.userID}/notices/${note.key}`, {
                  data: {approved: false,}
                }).then((x) => {
                  let id = Date.now().toString(16).toUpperCase();
                  let wantedRecipe = this.state.recipes.filter(rec => rec.key === note.recID)[0];
                    let newOwners = {};
                    newOwners[id] = note.userID;
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
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    const LANG = store.getState().lang;
  //  const INVENTORIES = this.state.inventories.filter(inventory => Object.values(inventory.owners).includes(store.getState().user.uid));
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
                     placeholder={textListRecipes.search[LANG]}
                     placeholderTextColor='rgb(0, 170, 160)'
                     onChangeText={(text) => this.setState({searchedWord: text})}/>
                 }
                 {!this.state.searchOpen
                   &&
                     <Title style={{ ...styles.headerItem }}> {textListRecipes.header[LANG]} </Title>
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

      <Text style={{ ...styles.listText, color: 'rgb(255, 184, 95)', height: deviceHeight*0.07 }}> {textListRecipes.newMess[LANG]}</Text>
      {
        this.state.notices
          .filter(note => !note.seen && note.key.includes("RR-"))
          .map(note =>
            {
              let user = this.state.users.filter(user => user.key === note.userID)[0];
              let recipe = Object.keys(this.state.recipes).filter(key => key === note.recID).map(key => this.state.recipes[key])[0];
             return(
               <Grid style={{ borderRadius: 15, backgroundColor: 'rgb(104, 70, 130)', width: deviceWidth*0.76, alignSelf: 'center' }}>
                  <Text style={{ ...styles.listText }}>
                    {`${user.username}` + textListRecipes.req[LANG]}
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
                      <Text style={{ ...styles.acordionButtonText }}>{textListRecipes.dec[LANG]}</Text>
                    </Button>
                  </Col>
                  <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.approveRequest(note)} >
                      <Text style={{ ...styles.acordionButtonText }}>{textListRecipes.acc[LANG]}</Text>
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
             <Text style={{ ...styles.listCardInvText, marginLeft:15 }}>{textListRecipes.chosenInv[LANG]}</Text>
             <Picker
                mode="dropdown"
                style={{ ...styles.picker }}
                selectedValue={this.state.selectedInventory}
                onValueChange={(e) => this.onValueChange(e)}
              >
                { this.state.inventories
                  &&
                  this.state.inventories
                  .filter(inventory => Object.values(inventory.owners).includes(store.getState().user.uid))
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
                      <Text style={{ ...styles.acordionButtonText }}>{textListRecipes.getRec[LANG]}</Text>
                    </Button>
                 </Col>
                 <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddRecipeCreate')} >
                      <Text style={{ ...styles.acordionButtonText }}>{textListRecipes.createRec[LANG]}</Text>
                    </Button>
                 </Col>
              </Row>
              </Grid>
            }

            <Card transparent style={{ ...styles.listCard }}>
               <List
                 dataArray={
                   Object.keys(this.state.recipes ? this.state.recipes : {})
                   .filter(key => this.state.recipes[key].owners
                                  && Object.values(this.state.recipes[key].owners).includes(store.getState().user.uid)
                                  && this.state.recipes[key].name.toLowerCase().includes(this.state.searchedWord.toLowerCase()))
                   .map(key => {
                     let item = {...this.state.recipes[key], key};
                  //   item.portions = (this.calculationPossible() ? this.getPortions(key) : -1);
                     return item;
                   })
                   .sort((a,b) => b.portions - a.portions)
                 }
                 renderRow={data =>
                   <ListItem button style={{...styles.listItem}} noBorder onPress={() => this.props.navigation.navigate('Recipe', {key: data.key, food: this.state.foodInInventory[this.state.selectedInventory], invKey: this.state.selectedInventory, cookable: data.portions > 0}) }>
                     <Left>
                       <Thumbnail
                         style={data.portions <= 0 ? { ...styles.stretch, ...styles.transparent } : { ...styles.stretch }}
                         source={{uri: data.image}}
                       />
                     <Text style={data.portions <= 0  ? { ...styles.listText, ...styles.transparent } : { ...styles.listText }}>{data.name}</Text></Left>
                     <Right>
                         <Badge style={data.portions <= 0 ? { ...styles.listTextBadge, ...styles.transparent } : { ...styles.listTextBadge }}>
                           <Text style={data.portions <= 0 ? { ...styles.listTextBadgeText } : { ...styles.listTextBadgeText }}>{data.portions <= 0 ? "0" : data.portions} </Text>
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
