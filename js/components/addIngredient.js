import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer,  Content, Header, Body, Title, Label, Form, Item, Card, Grid, Row, Col, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index.android';
import firebase from 'firebase';

import store from "../store/index";

import styles from '../style';

export default class AddIngredient extends Component {

  constructor(props) {
    super(props);
    this.state = {
      key: this.props.navigation.getParam('inventoryId', 'NO-ID'),

      ingredients: [],

      chosenIngredients: {},

      newIngredientId: "",
      newIngredientName: "",
      newIngredientAmount: "",
      newIngredientUnit: "",

        viaBarcode: false,
        viaForm: false,
    };

    this.addNewIngredient.bind(this);
    this.toggleCode.bind(this);
    this.toggleForm.bind(this);
    this.submit.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
      rebase.fetch(`ingredients`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((ingredients) => {
        this.setState({
          ingredients
        })
      });
    }

    submit(){
      let id = Date.now().toString(16).toUpperCase();

      if (this.state.validCode){

      }
      if (this.state.title !== ""){

        let data = {}

        Object.keys(this.state.chosenIngredients).map(key =>
          data[key.toString()] = (this.state.chosenIngredients[key].amount + " " + this.state.chosenIngredients[key].unit)
        );

        console.log(data);
        console.log("5".toString());

        rebase.update(`foodInInventory/${this.state.key}`, {
          data: data
        }).then(newLocation => {
            this.setState({
              ingredients: [],

              chosenIngredients: {},

              newIngredientId: "",
              newIngredientName: "",
              newIngredientAmount: "",
              newIngredientUnit: "",

              viaBarcode: false,
              viaForm: false,

            });
        });
      }

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

    addNewIngredient(){
      if (this.state.newIngredientName !== ""
      && this.state.newIngredientUnit !== ""
      && this.state.newIngredientAmount !== ""){
      }
      let newChosenIngredients = {...this.state.chosenIngredients};
      newChosenIngredients[this.state.newIngredientId] = {
        name: this.state.newIngredientName,
        amount: this.state.newIngredientAmount,
        unit: this.state.newIngredientUnit,
      };
      this.setState({
        chosenIngredients: newChosenIngredients,
        newIngredientName: "",
        newIngredientUnit: "",
        newIngredientAmount: "",
        newIngredientId: "",
      });
    }

    removeIngredient(key){
      let newChosenIngredients = {...this.state.chosenIngredients};
      delete newChosenIngredients[key];
        this.setState({
          newChosenIngredients: chosenIngredients,
        });
    }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  render() {
    console.log("loggin");
    const PICKER_ITEMS = this.state.ingredients.map(ingredient =>
                <Picker.Item key={ingredient.key} label={ingredient.name} value={ingredient.name} />
            );
           PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);
           console.log(this.state.ingredients);
Object.keys(this.state.ingredients).map(key => console.log(this.state.chosenIngredients[key]));
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
                (this.state.validCode || Object.keys(this.state.chosenIngredients).length > 0)
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
                   Object.keys(this.state.chosenIngredients).map(key =>

                     <Row size={10} >
                       <Col size={35}>
                       <Picker
                         mode="dropdown"
                         style={{ ...styles.ingredientPicker }}
                         selectedValue={this.state.chosenIngredients[key].name}
                         onValueChange={(itemValue, itemIndex) => {
                                         let newChosenIngredients = {...this.state.chosenIngredients};
                                         newChosenIngredients[key].name = itemValue;
                                         this.setState({
                                            chosenIngredients: newChosenIngredients,
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
                          value={this.state.chosenIngredients[key].amount}
                          onChangeText={(text) =>{
                                        let newChosenIngredients = {...this.state.chosenIngredients};
                                        newChosenIngredients[key].amount = text;
                                        this.setState({
                                          chosenIngredients: newChosenIngredients,
                                        });
                                      }
                          }/>
                        </Col>

                        <Col size={25}>
                          <Picker
                              mode="dropdown"
                              style={{ ...styles.unitPicker }}
                              selectedValue={this.state.chosenIngredients[key].unit}
                              onValueChange={(itemValue, itemIndex) =>{
                                                let newChosenIngredients = {...this.state.chosenIngredients};
                                                newChosenIngredients[key].unit = itemValue;
                                               this.setState({
                                                 chosenIngredients: newChosenIngredients,
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
                                            newIngredientName: itemValue,
                                            newIngredientId: itemIndex,
                                          })
                        }>

                        {PICKER_ITEMS}
                       </Picker>
                     </Col>

                      <Col size={30}>
                         <Input
                          style={{ ...styles.amountInput }}
                          value={this.state.newIngredientAmount}
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
                         {(this.state.newIngredientName !== ""
                         && this.state.newIngredientUnit !== ""
                         && this.state.newIngredientAmount !== "")
                         &&
                         <Icon name='md-add' style={{ ...styles.minusIngredient }} onPress={this.addNewIngredient.bind(this)}/>
                         }
                       </Col>

                       </Row>
                      </Grid>
                    </Card>
            }

          </Content>
        </Container>
      </Drawer>
    );
  }
}
