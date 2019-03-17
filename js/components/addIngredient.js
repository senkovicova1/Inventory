import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer,  Content, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index.android';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import store from "../store/index";

import styles from '../style';

export default class AddIngredient extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: "",
        body: "",
        ingredients: [],
        chosenIgredientsName: {},
        chosenIgredientsAmount: {},
        chosenIgredientsUnit: {},

        newIngredientName: "",
        newIngredientAmount: "",
        newIngredientUnit: "",

        writtenCode: "",
        validCode: "",

        recipeIDs: [],

        selected2: undefined,

        searchOpen: false,

        viaBarcode: false,
        viaForm: false,
    };

    this.addNewIngredient.bind(this);
    this.handleWrittenCode.bind(this);
    this.handleTitle.bind(this);
    this.toggleCode.bind(this);
    this.toggleForm.bind(this);
    this.submit.bind(this);
    this.toggleSearch.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
  /*    rebase.fetch(`ingredients`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((ingredients) => {
        rebase.fetch(`recipes`, {
          context: this,
          withIds: true,
          asArray: true
        }).then((rec) => {
          this.setState({
            ingredients,
            recipeIDs: rec.map(recipe => recipe.key)
          })
        });
      });*/
    }

    submit(){
    /*  console.log("meh");
      let id = Date.now().toString(16).toUpperCase();
      if (this.state.validCode){
        rebase.post(`recipeAccess/${id}`, {
          data: {userID: this.state.userID, recID: this.state.writtenCode}
        }).then(newLocation => {
        });
      }
      if (this.state.title !== ""){
        rebase.post(`recipeAccess/${id}`, {
          data: {userID: this.state.userID, recID: id}
        }).then(newLocation => {
            let ings = {};
            Object.keys(this.state.chosenIgredientsName).map(key => {
              if (this.state.chosenIgredientsUnit[key] !== undefined && this.state.chosenIgredientsAmount[key] !== undefined){
                ings[key] = this.state.chosenIgredientsAmount[key] + " " + this.state.chosenIgredientsUnit[key];
              }
              return 0;
            });
            rebase.post(`recipes/${id}`, {
              data: {name: this.state.title, body: this.state.body, ingredients: ings}
            })
        });
      }
*/
      this.props.navigation.goBack();
    }

    toggleCode(){
      this.setState({
        viaBarcode: !this.state.viaBarcode,
      })
    }

    toggleForm(){
      this.setState({
        viaForm: !this.state.viaForm,
      })
    }

    onValueChange2(value: string) {
      this.setState({
        selected2: value
      });
    }

    handleWrittenCode(text){
      if (this.state.recipeIDs.includes(text)){
        this.setState({
          validCode: true,
          writtenCode: text,
        });
      } else {
        this.setState({
          validCode: false,
          writtenCode: text,
        });
      }
    }

    handleTitle(text){
      this.setState({
        title: text,
      });
    }

    toggleSearch(){
      this.setState({
        searchOpen: !this.state.searchOpen,
      });
    }

    addNewIngredient(){
      if (this.state.newIngredientName !== ""
      && this.state.newIngredientUnit !== ""
      && this.state.newIngredientAmount !== ""){
      }
    }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  render() {
    const PICKER_ITEMS = this.state.ingredients.map(ingredient =>
                <Picker.Item key={ingredient.key} label={ingredient.name} value={ingredient.name} />
            );
           PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);

    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
        onClose={() => this.closeDrawer()} >
        <Container>
          <Header style={{ ...styles.header}}>
            <Left>
              <Button transparent onPress={() => this.props.navigation.goBack()}>
                <Icon name="md-close" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Body>
              <Title style={{ ...styles.headerItem }}>Add ingredient</Title>
            </Body>
            <Right>
              {
                (this.state.validCode || this.state.title !== "")
                &&
              <Button transparent><Icon name="md-checkmark"  style={{ ...styles.headerItem }} onPress={()=> this.submit()} /></Button>
              }
          </Right>

          </Header>

          <Content style={{ ...styles.content}} >

            <Button block style={{ ...styles.acordionButton }} onPress={() => this.setState({viaBarcode: !this.state.viaBarcode})}>
                <Text style={{ ...styles.acordionButtonText }}>Scan barcode</Text>
            </Button>

            {
              this.state.viaBarcode
              &&
              <Item>
                <Text>Here be barcode scanner</Text>
              </Item>
            }


            <Button block style={{ ...styles.acordionButton }} onPress={this.toggleForm.bind(this)}>
                <Text style={{ ...styles.acordionButtonText }}>Add manually</Text>
            </Button>

            {
              this.state.viaForm
              &&
              <Form>
                <Item>
                  <Input
                    style={{ ...styles.acordionText }}
                    placeholder="Enter name"
                    onChangeText={(text) => this.handleTitle(text)}/>
                </Item>

            <Item>
              <Picker
                mode="dropdown"
                style={{ ...styles.ingredientPicker }}
                selectedValue={this.state.newIngredientName}
                onValueChange={(itemValue, itemIndex) =>
                                  this.setState({
                                    newIngredientName: itemValue
                                  })
                }>
                    {PICKER_ITEMS}
                </Picker>

                <Input
                  style={{ ...styles.amountInput }}
                  value={this.state.newIgredientAmount}
                  onChangeText={(text) =>
                    this.setState({
                      newIngredientAmount: text
                    })
                  }/>

                <Picker
                   mode="dropdown"
                   style={{ ...styles.unitPicker }}
                   selectedValue={this.state.newIngredientUnit}
                   onValueChange={(itemValue, itemIndex) =>
                                    this.setState({
                                      newIngredientUnit: itemValue
                                    })
                }>
                  <Picker.Item key="0" label="" value=""/>

                  <Picker.Item key="1" label="ml" value="ml"/>
                  <Picker.Item key="2" label="dcl" value="dcl"/>
                  <Picker.Item key="3" label="l" value="l"/>

                  <Picker.Item key="4" label="g" value="g"/>
                  <Picker.Item key="4" label="dkg" value="dkg"/>
                  <Picker.Item key="5" label="kg" value="kg"/>

                  <Picker.Item key="6" label="pcs" value="pcs"/>

                  <Picker.Item key="7" label="tsp" value="tsp"/>
                  <Picker.Item key="8" label="tbsp" value="tbsp"/>

                  <Picker.Item key="9" label="cup" value="cup"/>
                 </Picker>

                <Icon name='md-add' style={{ ...styles.minusIngredient }} onPress={this.addNewIngredient.bind(this)}/>
                </Item>
              </Form>
            }

          </Content>
        </Container>
      </Drawer>
    );
  }
}
