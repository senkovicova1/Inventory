import React, {Component} from 'react';
import {Image, Platform, BackHandler/*, Share*/} from 'react-native';
import { Drawer,  Content, Header, Body, Title, Label, Form, Item, Input, Card, CardItem, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index';
import { fb } from '../../index';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob'

import {unitToBasic} from '../helperFiles/helperFunctions';
import {textDetailRecipe} from '../helperFiles/dictionary';

import store from "../store/index";

import styles from '../style';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

export default class DetailRecipe extends Component {

  constructor(props) {
    super(props);
    this.state = {
        showID: false,
        name: "",
        key: this.props.navigation.getParam('key', 'NO-ID'),
        food: this.props.navigation.getParam('food', 'NO-ID'),
        cookable: this.props.navigation.getParam('cookable', 'NO-ID'),
        invKey: this.props.navigation.getParam('invKey', 'NO-ID'),
        body: "",
        ingredients: null,
        image: null,
        owners: null,
        ppl: "1",
    };

    this.cook.bind(this);
    this.shareStuff2.bind(this);
    this.checkNumber.bind(this);
    this.changeAmount.bind(this);
    this.changeAmountPpl.bind(this);
    this.fetch.bind(this);
    this.fetch(this.props.navigation.getParam('key', 'NO-ID'));
  }

  fetch(id){
    rebase.fetch(`recipes/${id}`, {
         context: this,
         withIds: true,
       }).then((recipe) => {
    rebase.fetch(`ingredients`, {
         context: this,
         withIds: true,
         asArray: true,
       }).then((ings) => {
         let actualIngs = [];
          if (recipe.ingredients) {
            actualIngs = Object.keys(recipe.ingredients).map(key => {
             let name = ings.filter(ingredient => ingredient.key === key.toString()).map(ingredient => ingredient.name)[0];
             return ({name, amount: recipe.ingredients[key], defaultAmount: recipe.ingredients[key], key: key.toString()});
           });
         }
         this.setState({
           ingredients: actualIngs,
           name: recipe.name,
           key: id,
           body: recipe.body,
           image: recipe.image,
           owners: recipe.owners,
         })
       });
    });
  }

  checkNumber(text){
    return !isNaN(text) && !isNaN(parseFloat(text));
  }

  componentWillReceiveProps(){
    if(props.navigation.getParam('key', 'NO-ID') !== this.state.key){
      this.setState({
        showID: false,
        food: props.navigation.getParam('food', 'NO-ID'),
        cookable: props.navigation.getParam('cookable', 'NO-ID'),
        invKey: props.navigation.getParam('invKey', 'NO-ID'),
      });
      this.fetch(props.navigation.getParam('key', 'NO-ID'));
    }
  }

  changeAmount(code, amount){
    let newIngredients = [...this.state.ingredients];
    let index = newIngredients.findIndex((item)=>item.key===code);
    let arr = newIngredients[index].amount.split(" ");
    let oldAmount = parseFloat(arr[0]);
    let differences = [{id:1, value:0.05},{id:10, value:0.5},{id:25, value:1},{id:100, value:5},{id:500, value:25},{id:1000, value:50}];
    let difference = differences.find((item)=>item.id >= oldAmount);
    if(difference === undefined){
      difference = 100;
    }else{
      difference = difference.value;
    }

    if (amount < 0){
      oldAmount -= difference;
    } else{
      oldAmount += difference;
    }
    oldAmount = parseFloat((oldAmount < 0 ? 0 : oldAmount).toFixed(2));
    newIngredients[index] = {...newIngredients[index],amount:oldAmount + " " + arr[1]};
    if (this.state.cookable && this.checkAmount(code, oldAmount, arr[1])){
      this.setState({
        ingredients: newIngredients,
      });
    }else{
      console.log('Neda sa uvarit');
    }
  }

  changeAmountPpl(ppl){
    let newIngredients = this.state.ingredients.map(ing => {
      let newIng = {...ing};
      let arr = newIng.amount.split(" ");
      if ( arr[0] === "-" || arr[0] === "--"){
        return (newIng);
      }

      let base = parseFloat(newIng.defaultAmount.split(" ")[0]);

      if (ppl !== ""){
        let newAmount = base * ppl;
        newIng.amount = newAmount + " " + arr[1];
      } else {
        newIng.amount = base + " " + arr[1];
      }

      if (this.checkAmount(ing.key, newIng.amount.split(" ")[0], arr[1])) {
        return newIng;
      } else {
        return ing;
      }
    });
    this.setState({
      ingredients: newIngredients,
      ppl,
    });
  }

  checkAmount(ingId, amount1, unit1){
    let item2 = this.state.food[ingId].split(" ");
    return unitToBasic(amount1,unit1) <= unitToBasic(item2[0],item2[1]);
  }

  handleBackPress = () => {
      this.props.navigation.navigate('Recipes');
      return true;
  }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  shareStuff2(){
    const OPTIONS = {
        title: 'Share please?',
        message: `Look at this cool recipe: ${this.state.name}`,
        url: `${this.state.image}`,
    };
    Share.open(OPTIONS)
    .then((res) => {/* console.log(res) */})
    .catch((err) => {/* err && console.log(err);*/ });
  }

  cook(){
    let data = {};
    this.state.ingredients.map(ing => {
      let arr1 = ing.amount.split(" ");
      let amount1 = parseFloat(arr1[0]);
      let unit1 = arr1[1];

      if (amount1.includes("-")){
        return;
      }

      let arr2 = this.state.food[ing.key].split(" ");
      let amount2 = parseFloat(arr2[0]);
      let unit2 = arr2[1];

      let finalAmount = "0";
      let finalUnit = "g";

      if (["g", "kg", "dkg"].includes(unit1) && ["g", "kg", "dkg"].includes(unit2)){
        if (unit1 === "dkg"){
          unit1 = "g";
          amount1 = amount1*10;
        }
        if (unit1 === "kg"){
          unit1 = "g";
          amount1 = amount1*1000;
        }
        if (unit2 === "dkg"){
          unit2 = "g";
          amount2 = amount2*10;
        }
        if (unit2 === "kg"){
          unit2 = "g";
          amount2 = amount2*1000;
        }
        finalAmount = amount2 - amount1;
        finalUnit = "g";
        if (finalAmount >= 1000){
          finalAmount = finalAmount/1000;
          finalUnit = "kg";
        }

      } else if (["ml", "dcl", "l"].includes(unit1) && ["ml", "dcl", "l"].includes(unit2)){
        if (unit1 === "dcl"){
          unit1 = "ml";
          amount1 = amount1*100;
        }
        if (unit1 === "l"){
          unit1 = "ml";
          amount1 = amount1*1000;
        }
        if (unit2 === "dcl"){
          unit2 = "ml";
          amount2 = amount2*100;
        }
        if (unit2 === "l"){
          unit2 = "ml";
          amount2 = amount2*1000;
        }
        finalAmount = amount2 - amount1;
        finalUnit = "ml";
        if (finalAmount >= 1000){
          finalAmount = finalAmount/1000;
          finalUnit = "l";
        }
      } else if (["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit1) && ["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit2)){
        if (unit1 === "tbsp" || unit1 === "pl"){
          unit1 = "tsp";
          amount1 = amount1*3;
        }
        if (unit1 === "cup" || unit2 === "šálka"){
          unit1 = "tsp";
          amount1 = amount1*3*16;
        }
        if (unit2 === "tbsp" || unit1 === "pl"){
          unit2 = "tsp";
          amount2 = amount2*3;
        }
        if (unit2 === "cup" || unit2 === "šálka"){
          unit2 = "tsp";
          amount2 = amount2*3*16;
        }
        finalAmount = amount2 - amount1;
        finalUnit = "tsp";
        if (finalAmount >= 15){
          finalAmount = finalAmount/3;
          finalUnit = "tbsp";
        } else if (finalAmount >= 48){
          finalAmount = finalAmount/48;
          finalUnit = "cup";
        }

      } else if (["pcs", "ks"].includes(unit1) && ["pcs", "ks"].includes(unit2)){
        finalAmount = amount2 - amount1;
        finalUnit = unit2;

      } else {
        finalAmount = amount2;
        finalUnit = unit2;
      }

      data[ing.key] = finalAmount + " " + finalUnit;
    });

    rebase.update(`foodInInventory/${this.state.invKey}`, {
      data: data
    });
  }

  render() {
    const LANG = store.getState().lang;

    return (
        <Container>
          <Header style={{ ...styles.header}}>
            <Left>
              <Button transparent onPress={() => this.props.navigation.goBack()}>
                <Icon name="arrow-back" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Body>
              <Title style={{ ...styles.headerItem }} >{this.state.showID ? this.state.key : this.state.name}</Title>
            </Body>
            <Right>
              <Button transparent onPress={()=> this.props.navigation.navigate('EditRecipe', {name: this.state.name, key: this.state.key, body: this.state.body, ingredients: this.state.ingredients, image: this.state.image, owners: this.state.owners})}>
                <Icon name="md-create" style={{ ...styles.headerItem }} /><Text></Text>
              </Button>
              <Button transparent onPress={()=> this.shareStuff2()}>
                <Icon name="md-share" style={{ ...styles.headerItem }} /><Text></Text>
              </Button>
            </Right>

          </Header>

          <Content padder style={{ ...styles.content }}>
{ this.state.image
  &&
              <Image
                style={{ ...styles.image, ...styles.center }}
                source={{uri: this.state.image}}
                />
            }
           <Card transparent style={{ ...styles.listCard }}>
             <Grid >
               <Row>
                 <Col size={70}>
                   <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginLeft: 10, marginBottom: 5, paddingLeft: 10}}>
                     {textDetailRecipe.ingList[LANG]}
                      <Text style={{ ...styles.PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5, fontSize: 11}}>
                        {textDetailRecipe.dfAmount[LANG]}
                      </Text>
                  </Text>
                 </Col>
                 <Col size={30}>
                   <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5, marginRight: 10}}>
                     {textDetailRecipe.amount[LANG]}
                   </Text>
                 </Col>
             </Row>
              {this.state.ingredients
                &&
                this.state.ingredients.length > 0
                &&
               this.state.ingredients
               .map(item =>
                  <Row style={{...styles.listItemInRecipe}}>

                     <Col size={50}>
                     <Text style={{ ...styles.detailRecipeRowText}}>
                       {item.name}
                       <Text style={{ ...styles.detailRecipeRowText, ...styles.PEACH, fontSize: 11 }}>
                         {`   (${item.defaultAmount})`}
                       </Text>
                     </Text>
                     </Col>

                      <Col size={40}>
                        <Row>
                          <Col size={15}>
                            { this.state.cookable
                              &&
                              (item.amount && !item.amount.includes("-"))
                              &&
                                <Icon name="md-arrow-dropdown" onPress={() => this.changeAmount(item.key, -1)} style={{ alignSelf: 'center', ...styles.DARK_PEACH, paddingLeft: 5, paddingRight: 5 }}/>
                              }
                          </Col>
                          <Col size={30}>
                            {/*<Input
                              style={{ ...styles.PEACH, alignSelf: 'center', marginTop: -5, padding: 0}}
                              keyboardType='numeric'
                              value={item.amount.split(" ")[0]}
                              onChangeText={(text) =>{
                                  let diff = parseInt(text) - parseInt(item.amount.split(" ")[0]);
                                  this.changeAmount(item.key, diff);
                                }
                              }/>*/}
                            <Text style={{ ...styles.PEACH, alignSelf: 'center', marginTop: 0, padding: 0}}>{item.amount} </Text>
                          </Col>

                          {/*<Button transparent small style={{ backgroundColor: "#FFFFFF"}} >*/}
                          <Col size={15}>
                            { this.state.cookable
                              &&
                              (item.amount && !item.amount.includes("-"))
                              &&
                                <Icon name="md-arrow-dropup" onPress={() => this.changeAmount(item.key, 1)}  style={{ alignSelf: 'center', ...styles.DARK_PEACH, paddingLeft: 5, paddingRight: 5 }}/>

                            }
                          </Col>
                        </Row>
                     </Col>
                  </Row>
               )
                }
                <Row >
                    <Text style={{ ...styles.PEACH }}> {" "} {textDetailRecipe.portions[LANG]}  {"  "}</Text>
                    <Item regular style={{ borderColor: 'rgb(255, 184, 95)', width: 50, height: 24, borderRadius: 5, marginBottom: 5}}>
                      <Input
                        style={{ ...styles.PEACH }}
                        keyboardType='numeric'
                        value={this.state.ppl}
                        onChangeText={(text) =>{
                            if (this.state.cookable && (text === "" || this.checkNumber(text))){
                              this.changeAmountPpl(text);
                            }
                          }
                        }/>
                    </Item>
                  </Row>
                  <Row style={{ ...styles.right}}>
                    { this.state.cookable
                      &&
                  <Button style={{ ...styles.acordionButton}} onPress={() => this.cook()}>
                    <Text style={{ ...styles.DARK_PEACH }}> {textDetailRecipe.cook[LANG]} </Text>
                  </Button>
                }
                </Row>
          </Grid>
        </Card>


          <Card transparent style={{ ...styles.listCard}}>
              <Text style={{ ...styles.stepsCardHeader}}> {textDetailRecipe.steps[LANG]}</Text>
                <Text style={{ ...styles.stepsCardBody}}> {this.state.body}</Text>
          </Card>

          </Content>
        </Container>
    );
  }
}
