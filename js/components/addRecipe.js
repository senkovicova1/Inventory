import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer, Card, Content, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index.android';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import store from "../store/index";

import styles from '../style';

export default class AddRecipe extends Component {

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

        viaCode: false,
        viaForm: false,
    };

    this.addNewIngredient.bind(this);
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
                data: {name: this.state.title, body: this.state.body, ingredients: ings}
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
            });
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
                <Title style={{ ...styles.headerItem }}>New Recipe</Title>
              </Body>
              <Right>
                {
                  (this.state.validCode || this.state.title !== "")
                  &&
                <Button transparent><Icon name="md-checkmark"  style={{ ...styles.headerItem }} onPress={()=> this.submit()} /></Button>
                }
            </Right>

            </Header>

            <Content style={{ ...styles.content }} >

              <Button block style={{ ...styles.acordionButton }} onPress={this.toggleCode.bind(this)}>
                  <Text style={{ ...styles.acordionButtonText }}>Add Existing</Text>
              </Button>

              {
                this.state.viaCode
                &&
                <Item>
                  <Input
                    style={{ ...styles.formTitle}}
                    placeholder="Add recipe code"
                    placeholderTextColor='rgb(255, 184, 95)'
                    onChangeText={(text) => this.handleWrittenCode(text)}/>
                </Item>
              }

              {
                this.state.viaCode && !this.state.validCode && this.state.writtenCode.length >= 11
                &&
                <Item error style={{ ...styles.errorItem}}>
                  <Icon active name='md-alert' style={{ ...styles.errorText}}/>
                  <Label style={{ ...styles.errorText}}>This is not a valid recipe code!</Label>
                </Item>
              }


              <Button block style={{ ...styles.acordionButton, marginTop: 10 }} onPress={this.toggleForm.bind(this)}>
                  <Text style={{ ...styles.acordionButtonText }}>Create New</Text>
              </Button>

              {
                this.state.viaForm
                &&
                <Form>
                  <Item>
                    <Input
                      style={{ ...styles.formTitle }}
                      placeholder="Enter name"
                      placeholderTextColor='rgb(255, 184, 95)'
                      onChangeText={(text) => this.handleTitle(text)}/>
                  </Item>

                  <Card transparent style={{ ...styles.formCard}}>
                    <Grid >
                      <Row size={10} style={{borderBottomWidth: 2, borderColor: 'rgb(255, 184, 95)'}}>
                        <Col size={35}>
                          <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                            Ingredient
                          </Text>
                        </Col>
                      <Col size={30}>
                        <Text style={{marginLeft: 15, ...styles.DARK_PEACH}}>
                          Amount
                        </Text>
                      </Col>
                        <Col size={25}>
                          <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                            Unit
                          </Text>
                        </Col>
                       <Col size={10}>
                       </Col>

                    </Row>
                      {
                        Object.keys(this.state.chosenIgredientsName).map(key =>
                          <Row size={10} >
                            <Col size={35}>
                            <Picker
                              mode="dropdown"
                              style={{ ...styles.ingredientPicker }}
                              selectedValue={this.state.chosenIgredientsName[key]}
                              onValueChange={(itemValue, itemIndex) => {
                                              let newChosenIingredientsName = {...this.state.chosenIgredientsName};
                                              newChosenIingredientsName[key] = itemValue;
                                              this.setState({
                                                 chosenIgredientsName: newChosenIingredientsName,
                                               });
                                             }
                              }>
                                {this.state.ingredients.map(ingredient =>
                                      <Picker.Item key={ingredient.key} label={ingredient.name} value={ingredient.name} />
                                  )
                                }
                              </Picker>
                            </Col>

                            <Col size={30}>
                              <Input
                                style={{ ...styles.amountInput }}
                                value={this.state.chosenIgredientsAmount[key]}
                                onChangeText={(text) =>{
                                      let newChosenIingredientsAmount = {...this.state.chosenIgredientsAmount};
                                      newChosenIingredientsAmount[key] = text;
                                      this.setState({
                                        chosenIgredientsAmount: newChosenIngredientsAmount,
                                      });
                                  }
                                }/>
                            </Col>

                            <Col size={25}>
                                <Picker
                                   mode="dropdown"
                                   style={{ ...styles.unitPicker }}
                                   selectedValue={this.state.chosenIgredientsUnit[key]}
                                   onValueChange={(itemValue, itemIndex) =>{
                                                   let newChosenIingredientsUnitt = {...this.state.chosenIgredientsUnit};
                                                   newChosenIingredientsUnitt[key] = itemValue;
                                                    this.setState({
                                                      chosenIgredientsUnit: newChosenIingredientsUnit,
                                                    });
                                                  }
                                 }>

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
                              </Col>

                              <Col size={10}>
                                  <Icon name='md-remove-circle' style={{ ...styles.minusIngredient }} onPress={() => this.removeIngredient(key)}/>
                              </Col>
                          </Row>
                        )}


                        <Row size={10}>
                          <Col size={35}>
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
                          </Col>
                          <Col size={30}>
                            <Input
                              style={{ ...styles.amountInput }}
                              placeholder=""
                              placeholderTextColor='rgb(255, 122, 90)'
                              value={this.state.newIgredientAmount}
                              onChangeText={(text) =>
                                this.setState({
                                  newIngredientAmount: text
                                })
                              }/>
                          </Col>

                          <Col size={25}>
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
                         </Col>

                         <Col size={10}>
                          <Icon name='md-add' style={{ ...styles.minusIngredient }} onPress={this.addNewIngredient.bind(this)}/>
                        </Col>

                       </Row>
                      </Grid>
                    </Card>
                    <Card transparent style={{ ...styles.formCard}}>
                      <Textarea
                        rowSpan={5}
                        bordered
                        placeholder="Steps"
                        placeholderTextColor='rgb(255, 184, 95)'
                        style={{...styles.textArea}}
                        onChangeText={(text) => this.setState({body: text})}
                        value={this.state.body}/>
                    </Card>
                </Form>
              }


            </Content>
          </Container>
      </Drawer>
    );
  }
}
