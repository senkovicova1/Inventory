import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer, Card, Content, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index.android';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import store from "../store/index";

import styles from '../style';

export default class EditRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
       showID: false,
       name: this.props.navigation.getParam('name', 'NO-ID'),
       key: this.props.navigation.getParam('keyy', 'NO-ID'),
       body: this.props.navigation.getParam('body', 'NO-ID'),
       ingredientsInRecipe: this.props.navigation.getParam('ingredients', 'NO-ID'),
       userID: 1,

       ingredients: [],
       chosenIgredientsName: {},
       chosenIgredientsAmount: {},
       chosenIgredientsUnit: {},

       newIngredientName: "",
       newIngredientAmount: "",
       newIngredientUnit: "",

       searchOpen: false,
    };

    this.addNewIngredient.bind(this);
    this.removeIngredient.bind(this);
    this.submit.bind(this);
     this.fetch.bind(this);
     this.fetch();
  }

  fetch(){
       rebase.fetch(`ingredients`, {
         context: this,
         withIds: true,
         asArray: true
       }).then((ingredients) =>
           this.setState({
             ingredients,
           })
         );
     }

   submit(){
     console.log("meh");

     let ings = {};
     Object.keys(this.state.ingredientsInRecipe).map(key =>
       ings[this.state.ingredientsInRecipe[key].key] = this.state.ingredientsInRecipe[key].amount);

     rebase.update(`recipes/${this.state.key}`, {
       data: {name: this.state.name, body: this.state.body, ingredients: ings}
     });

     let rec = {
       name: this.state.name,
       key: this.state.key,
       body: this.state.body,
       ingredients: this.state.ingredients,
     }

     this.props.navigation.navigate("Recipe", {rec: rec});
   }

   addNewIngredient(){
     if (this.state.newIngredientName.length > 0
     && this.state.newIngredientUnit.length > 0
     && this.state.newIngredientAmount.length > 0){
       let key = this.state.ingredients.filter(ing => ing.name === this.state.newIngredientName)[0].key;
       let object = {key: key, name: this.state.newIngredientName, amount: this.state.newIngredientAmount + " " + this.state.newIngredientUnit};
       let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
       newIngredientsInRecipe[newIngredientsInRecipe.length] = object,
         this.setState({
           ingredientsInRecipe: newIngredientsInRecipe,

           newIngredientName: "",
           newIngredientUnit: "",
           newIngredientAmount: "",
         });
     }
   }

   removeIngredient(key){
     let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
     delete newIngredientsInRecipe[key];
       this.setState({
         ingredientsInRecipe: newIngredientsInRecipe,
       });

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
                <Title style={{ ...styles.headerItem }}>Edit Recipe</Title>
              </Body>
              <Right>
                <Button transparent><Icon name="md-checkmark"  style={{ ...styles.headerItem }} onPress={()=> this.submit()} /></Button>
              </Right>
            </Header>

            <Content style={{ ...styles.content }} >

            <Form>
               <Item>
                 <Input
                   style={{  ...styles.formTitle }}
                   placeholder="Enter name"
                   placeholderTextColor='rgb(255, 184, 95)'
                   value={this.state.name}
                   onChangeText={(text) => this.setState({name: text})}/>
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
                    Object.keys(this.state.ingredientsInRecipe).map(key =>
                      <Row size={10} >
                        <Col size={35}>
                        <Picker
                          mode="dropdown"
                          style={{ ...styles.ingredientPicker }}
                          selectedValue={this.state.ingredientsInRecipe[key].name}
                          onValueChange={(itemValue, itemIndex) => {
                                          let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
                                          newIngredientsInRecipe[key].name = itemValue;
                                          this.setState({
                                             ingredientsInRecipe: newIngredientsInRecipe,
                                           });
                                         }
                          }>
                          {PICKER_ITEMS}
                          </Picker>
                        </Col>

                        <Col size={30}>
                          <Input
                           style={{ ...styles.amountInput }}
                           value={this.state.ingredientsInRecipe[key].amount.substring(0, this.state.ingredientsInRecipe[key].amount.indexOf(" "))}
                           placeholder=""
                           onChangeText={(text) =>{
                                 let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
                                 let newValue = text + " " + this.state.ingredientsInRecipe[key].amount.substring(this.state.ingredientsInRecipe[key].amount.indexOf(" ")+1);
                                 newIngredientsInRecipe[key].amount = newValue;
                                 this.setState({
                                   ingredientsInRecipe: newIngredientsInRecipe,
                                 });
                             }
                           }/>
                         </Col>

                         <Col size={25}>
                           <Picker
                               mode="dropdown"
                               style={{ ...styles.unitPicker }}
                               selectedValue={this.state.ingredientsInRecipe[key].amount.substring(this.state.ingredientsInRecipe[key].amount.indexOf(" ")+1)}
                               onValueChange={(itemValue, itemIndex) =>{
                                               let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
                                               let newValue = this.state.ingredientsInRecipe[key].amount.substring(0, this.state.ingredientsInRecipe[key].amount.indexOf(" ")) + " " + itemValue;
                                               newIngredientsInRecipe[key].amount = newValue;
                                                this.setState({
                                                  ingredientsInRecipe: newIngredientsInRecipe,
                                                });
                                              }
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

            </Content>
          </Container>
      </Drawer>
    );
  }
}
