import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, Content, Header, Toast, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

import store from "../store/index";

import styles from '../style';



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
        title: "",
        body: "",
        image: null,
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

        takePic: false,

        searchOpen: false,

        viaCode: false,
        viaForm: false,

        showUnsaved: false,
        changed: false,
    };

    this.handleBackPress.bind(this);

    this.addNewIngredient.bind(this);
    this.removeIngredient.bind(this);

    this.handleWrittenCode.bind(this);
    this.handleTitle.bind(this);
    this.toggleCode.bind(this),
    this.toggleForm.bind(this),
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    rebase.fetch(`ingredients`, {
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
    });
  }

      submit(){
        const USER_ID = store.getState().user.uid;
        let id = Date.now().toString(16).toUpperCase();

        if (this.state.validCode){
          rebase.post(`recipeAccess/${id}`, {
            data: {userID: USER_ID, recID: this.state.writtenCode}
          }).then(newLocation => {
          });
        }

        if (this.state.title !== ""){
          if (this.state.image){
          }

          rebase.post(`recipeAccess/${id}`, {
            data: {userID: USER_ID, recID: id}
          }).then(newLocation => {
              let ings = {};
              Object.keys(this.state.chosenIgredientsName).map(key => {
                if (this.state.chosenIgredientsUnit[key] !== undefined && this.state.chosenIgredientsAmount[key] !== undefined){
                  ings[key] = this.state.chosenIgredientsAmount[key] + " " + this.state.chosenIgredientsUnit[key];
                }
                return 0;
              });
              rebase.post(`recipes/${id}`, {
                data: {name: this.state.title, body: this.state.body, ingredients: ings, image: this.state.image}
              })
          });
        }

        this.props.navigation.push('Recipes');
      }

      toggleCode(){
        this.setState({
          viaCode: !this.state.viaCode,
        })
      }

      toggleForm(){
        this.setState({
          viaForm: !this.state.viaForm,
        })
      }

      handleWrittenCode(text){
        if (this.state.recipeIDs.includes(text)){
          this.setState({
            validCode: true,
            writtenCode: text,
            changed: true
          });
        } else {
          this.setState({
            validCode: false,
            writtenCode: text,
            changed: true
          });
        }
      }

      handleTitle(text){
        this.setState({
          title: text,
          changed: true
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
            let index = this.state.ingredients.filter(ing => ing.name === this.state.newIngredientName)[0].key;

            let newChosenIingredientsName = {...this.state.chosenIgredientsName};
            newChosenIingredientsName[index] = this.state.newIngredientName;

            let newChosenIingredientsUnit = {...this.state.chosenIgredientsUnit};
            newChosenIingredientsUnit[index] = this.state.newIngredientUnit;

            let newChosenIingredientsAmount = {...this.state.chosenIgredientsAmount};
            newChosenIingredientsAmount[index] = this.state.newIngredientAmount;

            this.setState({
              chosenIgredientsName: newChosenIingredientsName,
              chosenIgredientsUnit: newChosenIingredientsUnit,
              chosenIgredientsAmount: newChosenIingredientsAmount,

              newIngredientName: "",
              newIngredientUnit: "",
              newIngredientAmount: "",

              changed: true
            });
        }
      }

      removeIngredient(key){
        let newChosenIingredientsName = {...this.state.chosenIgredientsName};
        delete newChosenIingredientsName[key];

        let newChosenIingredientsUnit = {...this.state.chosenIgredientsUnit};
        delete newChosenIingredientsUnit[key];

        let newChosenIingredientsAmount = {...this.state.chosenIgredientsAmount};
        delete newChosenIingredientsAmount[key];

        this.setState({
          chosenIgredientsName: newChosenIingredientsName,
          chosenIgredientsUnit: newChosenIingredientsUnit,
          chosenIgredientsAmount: newChosenIingredientsAmount,

          changed: true,
        });

      }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
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

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  takePicture = async function(camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
        this.setState({
          image: data.uri,
          takePic: false,
        })
    };


  render() {
    const deviceHeight = Dimensions.get('window').height;
    const deviceWidth = Dimensions.get('window').width;
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
                <Title style={{ ...styles.headerItem }}>New Recipe</Title>
              </Body>
              <Right>
                {
                  (this.state.validCode || this.state.title !== "")
                  &&
                <Button transparent>
                  <Icon name="md-checkmark"  style={{ ...styles.headerItem }} onPress={()=> this.submit()} />
                </Button>
                }
            </Right>

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

                <Item>
                  <Input
                    style={{ ...styles.formTitle}}
                    placeholder="Add recipe code"
                    placeholderTextColor='rgb(255, 184, 95)'
                    onChangeText={(text) => this.handleWrittenCode(text)}/>
                </Item>


              {
                !this.state.validCode && this.state.writtenCode.length >= 11
                &&
                <Item error style={{ ...styles.errorItem}}>
                  <Icon active name='md-alert' style={{ ...styles.errorText}}/>
                  <Label style={{ ...styles.errorText}}>This is not a valid recipe code!</Label>
                </Item>
              }


            </Content>
          </Container>
      </Drawer>
    );
  }
}
