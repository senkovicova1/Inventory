import React, {Component} from 'react';
import {Image, Platform, BackHandler} from 'react-native';
import { Drawer,  Content, Header, Body, Title, Label, Form, Item, Input, Card, CardItem, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import store from "../store/index";

import styles from '../style';

export default class DetailRecipe extends Component {

  constructor(props) {
    super(props);
    this.state = {
        showID: false,
        name: this.props.navigation.getParam('rec', 'NO-ID').name,
        key: this.props.navigation.getParam('rec', 'NO-ID').key,
        body: this.props.navigation.getParam('rec', 'NO-ID').body,
        ingredients: this.props.navigation.getParam('rec', 'NO-ID').ingredients ,
        image: this.props.navigation.getParam('rec', 'NO-ID').image,
    };

    this.checkNumber.bind(this);
    this.changeAmount.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    rebase.fetch(`ingredients`, {
         context: this,
         withIds: true,
         asArray: true,
       }).then((ings) => {
         let actualIngs = Object.keys(this.state.ingredients).map(key => {
           let name = ings.filter(ingredient => ingredient.key === key.toString()).map(ingredient => ingredient.name)[0];
           return ({name, amount: this.state.ingredients[key], key: key.toString()});
         });
         this.setState({
           ingredients: actualIngs,
         })
       });
  }

  changeAmount(id, amount){

  }

  checkNumber(text){
    return !isNaN(text) && !isNaN(parseFloat(text));
  }

  componentWillReceiveProps(){
    this.setState({
      showID: false,
        name: this.props.navigation.getParam('rec', 'NO-ID').name,
        key: this.props.navigation.getParam('rec', 'NO-ID').key,
        body: this.props.navigation.getParam('rec', 'NO-ID').body,
        ingredients: this.props.navigation.getParam('rec', 'NO-ID').ingredients,
        image: this.props.navigation.getParam('rec', 'NO-ID').image,
    });

    rebase.fetch(`ingredients`, {
         context: this,
         withIds: true,
         asArray: true,
       }).then((ings) => {
         let actualIngs = Object.keys(this.state.ingredients).map(key => {
           let name = ings.filter(ingredient => ingredient.key === key.toString()).map(ingredient => ingredient.name)[0];
           return ({name, amount: this.state.ingredients[key], key: key.toString()});
         });
         this.setState({
           ingredients: actualIngs,
         })
       });
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

  render() {
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
        onClose={() => this.closeDrawer()} >

        <Container>
          <Header style={{ ...styles.header}}>
            <Left>
              <Button transparent onPress={() => this.props.navigation.navigate("Recipes", {nom: "nom"})}>
                <Icon name="arrow-back" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Body>
              <Title style={{ ...styles.headerItem }} >{this.state.showID ? this.state.key : this.state.name}</Title>

            </Body>
            <Right>
              <Button transparent><Icon name="md-share-alt" style={{ ...styles.headerItem }} onPress={() => this.setState({showID: !this.state.showID })}/><Text></Text></Button>
              <Button transparent><Icon name="md-create" style={{ ...styles.headerItem }} onPress={()=> this.props.navigation.navigate('EditRecipe', {name: this.state.name, keyy: this.state.key, body: this.state.body, ingredients: this.state.ingredients, image: this.state.image})}/><Text></Text></Button>
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
                     Ingredient
                      <Text style={{ ...styles.PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5, fontSize: 11}}>
                        (default amount)
                      </Text>
                  </Text>
                 </Col>
                 <Col size={30}>
                   <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5, marginRight: 10}}>Amount</Text>
                 </Col>
             </Row>
              {
               Object.keys(this.state.ingredients)
               .map(item =>
                  <Row style={{...styles.listItemInRecipe}}>
                       <Col size={10}>
                         <Thumbnail
                           style={{ ...styles.thumbnl }}
                           source={require('../helperFiles/sushi.jpg')}
                         />
                     </Col>

                     <Col size={50}>
                     <Text style={{ ...styles.detailRecipeRowText}}>
                       {this.state.ingredients[item].name}
                       <Text style={{ ...styles.detailRecipeRowText, ...styles.PEACH, fontSize: 11 }}>
                         {`   (${this.state.ingredients[item].amount})`}
                       </Text>
                     </Text>
                     </Col>

                      <Col size={40}>
                        <Row>
                          <Col size={20}>
                          <Icon name="md-arrow-dropdown" style={{ alignSelf: 'center', ...styles.DARK_PEACH }}/>
                          </Col>
                          <Col size={20}>
                            <Text style={{ ...styles.PEACH, alignSelf: 'center', marginTop: -5, padding: 0,}}>{this.state.ingredients[item].amount} </Text>
                            </Col>
                            <Col size={20}>
                          <Icon name="md-arrow-dropup" style={{ alignSelf: 'center', ...styles.DARK_PEACH}}/>
                          </Col>
                        </Row>
                     </Col>
                  </Row>
               )
                }
                <Row >
                    <Text style={{ ...styles.PEACH }}>Počet osôb  {"  "}</Text>
                    <Item regular style={{ borderColor: 'rgb(255, 184, 95)', width: 50, height: 24, borderRadius: 5, marginBottom: 5}}>
                      <Input
                        style={{ ...styles.PEACH }}
                        keyboardType='numeric'
                        value={this.state.ppl}
                        onChangeText={(text) =>{
                            if (text === "" || this.checkNumber(text)){
                              this.setState({
                                ppl: text,
                              });
                            }
                          }
                        }/>
                    </Item>
                  </Row>
                  <Row style={{ ...styles.right}}>
                  <Button style={{ ...styles.acordionButton}}>
                    <Text style={{ ...styles.DARK_PEACH }}> Uvariť </Text>
                  </Button>
                </Row>
          </Grid>
        </Card>


          <Card transparent style={{ ...styles.listCard}}>
              <Text style={{ ...styles.stepsCardHeader}}> Steps</Text>
                <Text style={{ ...styles.stepsCardBody}}> {this.state.body}</Text>
          </Card>

          </Content>
        </Container>

      </Drawer>
    );
  }
}
