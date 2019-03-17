import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer,  Content, Header, Body, Title, Label, Form, Item, Input, Card, CardItem, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index.android';
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
        ingredients: this.props.navigation.getParam('rec', 'NO-ID').ingredients,
    };

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
              <Button transparent onPress={() => this.props.navigation.goBack()}>
                <Icon name="arrow-back" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Body>
              <Title style={{ ...styles.headerItem }} >{this.state.showID ? this.state.key : this.state.name}</Title>

            </Body>
            <Right>
              <Button transparent><Icon name="md-share-alt" style={{ ...styles.headerItem }} onPress={() => this.setState({showID: !this.state.showID })}/><Text></Text></Button>
              <Button transparent><Icon name="md-create" style={{ ...styles.headerItem }} onPress={()=> this.props.navigation.navigate('EditRecipe', {name: this.state.name, keyy: this.state.key, body: this.state.name, ingredients: this.state.ingredients})}/><Text></Text></Button>
            </Right>

          </Header>

          <Content padder style={{ ...styles.content }}>

           <List>
              <ListItem
                noBorder
                 key="obr"
                 style={{ ...styles.center }}>
                <Image
                    style={{ ...styles.image }}
                    source={require('../helperFiles/sushi.jpg')}
                  />
              </ListItem>
              <ListItem
                noBorder
                 key="title">
                 <Left>
                   <Text style={{ ...styles.minusIngredient, marginLeft: 40 }}>Ingredient</Text>
                 </Left>
                <Body>
                  <Text style={{ ...styles.minusIngredient, marginLeft: 60 }}>Amount</Text>
                </Body>
              </ListItem>
           {
             Object.keys(this.state.ingredients)
             .map(item =>
               <ListItem noBorder key={this.state.ingredients[item].key}>
                     <Left>
                     <Thumbnail
                       style={{ ...styles.thumbnl }}
                       source={require('../helperFiles/sushi.jpg')}
                     />
                   <Text style={{ ...styles.detailRecipeRowText }}>{this.state.ingredients[item].name}</Text>
                       </Left>
                    <Right>
                        <Button transparent><Text style={{ ...styles.minusIngredient }}>{this.state.ingredients[item].amount + "   "} </Text>
                        <Icon name="md-remove-circle" style={{ ...styles.minusIngredient }}/></Button>
                    </Right>
                  </ListItem>)
          }

            <ListItem style={{ ...styles.right, ...styles.minusIngredientButton }}>
              <Button
                transparent
                >
                <Text style={{ ...styles.minusIngredient }}> Odobrať všetky </Text>
                <Icon name="md-remove-circle" style={{ ...styles.minusIngredient }}/>
              </Button>
            </ListItem>
          </List>


          <Card>
            <CardItem header>
              <Text>Steps</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text> {this.state.body}</Text>
              </Body>
            </CardItem>
          </Card>

          </Content>
        </Container>

      </Drawer>
    );
  }
}
