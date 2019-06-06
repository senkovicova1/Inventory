import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View} from 'react-native';
import { Content, Toast,  Header, Body, Title, Label, Form, Item, Card, Grid, Row, Col, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, getTheme, variables } from 'native-base';
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

export default class AddIngredientManual extends Component {

  constructor(props) {
    super(props);
    this.state = {
      key: this.props.navigation.getParam('key', 'NO-ID'),

      ingredients: [],
      ownedIngredients: {},

      chosenIngredients: {},

      newIngredientId: "",
      newIngredientName: "",
      newIngredientAmount: "",
      newIngredientUnit: "",
      showIngredients: false,

      currentBarcode: "",
      containsBarcode: false,
      barcodes: {},

      newIngredient: {
        name: '',
        amount: '',
        unit: '',
        brand: '',
      },

      viaBarcode: false,
      viaForm: false,

      showUnsaved: false,
      changed: false,
    };

    this.handleBackPress.bind(this);
    this.checkNumber.bind(this);
    this.addNewIngredient.bind(this);
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
        rebase.fetch(`foodInInventory/${this.state.key}`, {
          context: this,
          withIds: true,
        }).then(ownedIngredients => {
            this.setState({
              ingredients,
              ownedIngredients,
            });
        });
      });
    }

    submit(){
      let id = Date.now().toString(16).toUpperCase();

      let data = {};

      Object.keys(this.state.chosenIngredients).map(key =>  {
        let unit1 = this.state.chosenIngredients[key].unit;
        let amount1 = parseFloat(this.state.chosenIngredients[key].amount);
        let unit2Exists = Object.keys(this.state.ownedIngredients).filter(id => id === key)[0];

        if (unit2Exists){
          let arr = this.state.ownedIngredients[unit2Exists].split(" ");
          let unit2 = arr[1];
          let amount2 = parseFloat(arr[0]);
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
            finalAmount = amount1 + amount2;
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
            finalAmount = amount1 + amount2;
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
            finalAmount = amount1 + amount2;
            finalUnit = "tsp";
            if (finalAmount >= 15){
              finalAmount = finalAmount/3;
              finalUnit = "tbsp";
            } else if (finalAmount >= 48){
              finalAmount = finalAmount/48;
              finalUnit = "cup";
            }

          } else if (["pcs", "ks"].includes(unit1) && ["pcs", "ks"].includes(unit2)){
            finalAmount = amount1 + amount2;
            finalUnit = unit2;

          } else {
            finalAmount = amount1;
            finalUnit = unit1;
          }

          data[key.toString()] = finalAmount + " " + finalUnit;
        } else {
          data[key.toString()] = this.state.chosenIngredients[key].amount + " " + this.state.chosenIngredients[key].unit;
        }
      });

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
            showIngredients: false,

            viaBarcode: false,
            viaForm: false,

            changed: false,
          });
      });


      this.props.navigation.goBack();
    }

    checkNumber(text){
      return !isNaN(text) && !isNaN(parseFloat(text));
    }

    addNewIngredient(){
      if (this.state.newIngredientName !== ""
      && this.state.newIngredientUnit !== ""
      && this.state.newIngredientAmount !== ""){

        let indexExists = this.state.ingredients.filter(ing => ing.name === this.state.newIngredientName)[0];
        let index = null;

        if (!indexExists) {
          let id = Date.now().toString(16).toUpperCase();
          rebase.post(`ingredients/${id}`, {
            data: {name: this.state.newIngredientName}
          });
          index = id;
        } else {
          index = indexExists.key;
        }

        let newChosenIngredients = {...this.state.chosenIngredients};
        newChosenIngredients[index] = {
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
          showIngredients: false,

          changed: true
        });
      }
    }


    removeIngredient(key){
      let newChosenIngredients = {...this.state.chosenIngredients};
      delete newChosenIngredients[key];
        this.setState({
          newChosenIngredients: chosenIngredients,

          changed: true
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
      this.props.navigation.goBack();
      return true;
    }
  }

  render() {
    const PICKER_ITEMS = Object.keys(this.state.ingredients).map(ingredient =>
                <Picker.Item key={this.state.ingredients[ingredient].key} label={this.state.ingredients[ingredient].name} value={this.state.ingredients[ingredient].name} />
            );
           PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);

    const INGREDIENTS = this.state.ingredients.filter(ing => ing.name.toLowerCase().includes(this.state.newIngredientName.toLowerCase()));

    return (
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
                (Object.keys(this.state.chosenIngredients).length > 0)
                &&
              <Button transparent  onPress={() => this.submit()} ><Icon name="md-checkmark"  style={{ ...styles.headerItem }}/></Button>
              }
          </Right>

          </Header>

          <Content style={{ ...styles.content}} >

            {this.state.showUnsaved
              &&
              Toast.show({
                text: `If you leave now, your changes will not be saved! If you wish to leave without saving your changes, press back button again.`,
                duration: 4000,
                type: 'danger'
              })
            }

                    <Card transparent style={{ ...styles.formCard}}>
                      <Grid >
                        <Row>
                          <Col size={100}>
                            <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>Ingredients</Text>
                          </Col>
                        </Row>
                       {
                         Object.keys(this.state.chosenIngredients).map(key =>
                           <Row size={10} >

                             <Col size={45}>
                               <Text style={{ ...styles.PEACH}}>{`${this.state.chosenIngredients[key].name}`}</Text>
                             </Col>


                             <Col size={25}>
                               <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                                   <Input
                                      style={{ ...styles.PEACH}}
                                      value={this.state.chosenIngredients[key].amount}
                                      keyboardType='numeric'
                                      onChangeText={(text) =>{
                                          if (text.length === 0 || text === "-" || text === "--" || this.checkNumber(text)){
                                            let newChosenIngredients = {...this.state.chosenIngredients};
                                            newChosenIngredients[amount] = text;

                                            this.setState({
                                              chosenIngredients: newChosenIngredients,
                                              changed: true
                                            });
                                          }
                                        }
                                      }/>
                                 </Item>
                              </Col>

                              <Col size={35}>
                                <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                                  <Picker
                                      mode="dropdown"
                                      style={{ ...styles.unitPicker, ...styles.PEACH, height: 24 }}
                                      selectedValue={this.state.chosenIngredients[key].unit}
                                      onValueChange={(itemValue, itemIndex) =>{
                                                        let newChosenIngredients = {...this.state.chosenIngredients};
                                                        newChosenIngredients[unit] = itemValue;

                                                        this.setState({
                                                          chosenIngredients: newChosenIngredients,
                                                          changed: true
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
                                </Item>
                              </Col>

                            </Row>
                         )}

                         <Row><Text>{"  "}</Text></Row>
                             <Row>
                               <Col size={100}>
                               <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>Add new ingredient</Text>
                               </Col>
                             </Row>

                             <Row size={10}>
                               <Col size={35}>
                                 <Text style={{ ...styles.DARK_PEACH }}>Name</Text>
                               </Col>

                               <Col size={65}>
                                 <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                                   <Input
                                     style={{ ...styles.PEACH }}
                                     value={this.state.newIngredientName}
                                     onChangeText={(text) =>{
                                           this.setState({
                                             newIngredientName: text,
                                             changed: true,
                                             showIngredients: true
                                           });
                                       }
                                     }
                                     onBlur={() => this.setState({
                                       showIngredients: false
                                     })}
                                   />
                                 </Item>
                               </Col>
                             </Row>

                             { this.state.showIngredients
                               &&
                               INGREDIENTS.map(ing =>
                                   <Row size={10}>
                                     <Col size={35}>
                                     </Col>

                                     <Col size={65}>
                                     <Item regular onPress={() => this.setState({newIngredientName: ing.name, showIngredients: false})} style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                                         <Text style={{ ...styles.PEACH}}>{`${ing.name}`}</Text>
                                     </Item>
                                     </Col>
                                   </Row>
                                 )
                             }

                               <Row size={10}>
                                 <Col size={35}>
                                   <Text style={{ ...styles.DARK_PEACH }}>Amount</Text>
                                 </Col>
                                 <Col size={65}>
                                   <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                                     <Input
                                       style={{ ...styles.PEACH }}
                                       keyboardType='numeric'
                                       value={this.state.newIngredientAmount}
                                       onChangeText={(text) =>{
                                           if (text === "-" || text === "--" || this.checkNumber(text) || text.length === 0){
                                             this.setState({
                                               newIngredientAmount: text,
                                               changed: true
                                             }, () => this.addNewIngredient());
                                           }
                                         }
                                       }/>
                                   </Item>
                                 </Col>
                               </Row>

                                <Row size={10}>
                                  <Col size={35}>
                                    <Text style={{ ...styles.DARK_PEACH }}>Unit</Text>
                                  </Col>
                                  <Col size={65}>
                                    <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                                        <Picker
                                           mode="dropdown"
                                           style={{ ...styles.unitPicker, ...styles.PEACH, height: 24  }}
                                           selectedValue={this.state.newIngredientUnit}
                                           onValueChange={(itemValue, itemIndex) =>
                                                   {
                                                       if(itemValue.length === 0){
                                                         return;
                                                       }
                                                        this.setState({
                                                          newIngredientUnit: itemValue,
                                                          changed: true
                                                        }, () => this.addNewIngredient());

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
                                   </Item>
                                 </Col>
                               </Row>
                        </Grid>
                      </Card>


          </Content>
        </Container>
    );
  }
}
