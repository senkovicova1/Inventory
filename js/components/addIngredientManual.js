import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Content, Toast,  Header, Body, Title, Label, Form, Item, Card, Grid, Row, Col, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

import {unitToBasic} from '../helperFiles/helperFunctions';
import {textAddManually} from '../helperFiles/dictionary';

import store from "../store/index";

import styles from '../style';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;
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

      showUnsaved: false,
      changed: false,
    };

    this.handleBackPress.bind(this);
    this.handleBackPressButton.bind(this);
    this.checkNumber.bind(this);
    this.addNewIngredient.bind(this);
    this.submit.bind(this);
    this.fetch.bind(this);
    this.fetch(this.props.navigation.getParam('key', 'NO-ID'));
  }

  fetch(id){
      rebase.fetch(`ingredients`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((ingredients) => {
        rebase.fetch(`foodInInventory/${id}`, {
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

    componentWillReceiveProps(props){
      if(props.navigation.getParam('key', 'NO-ID') !== this.state.key){
        this.setState({
          ingredients: [],
          ownedIngredients: {},

          chosenIngredients: {},

          newIngredientId: "",
          newIngredientName: "",
          newIngredientAmount: "",
          newIngredientUnit: "",
          showIngredients: false,

          showUnsaved: false,
          changed: false,
        });
        this.fetch(props.navigation.getParam('key', 'NO-ID'));
      }
    }

    submit(){
      let id = Date.now().toString(16).toUpperCase();

      let data = {};

      Object.keys(this.state.chosenIngredients).map(key =>  {
        let unit1 = this.state.chosenIngredients[key].unit;
        let amount1 = unitToBasic(this.state.chosenIngredients[key].amount, unit1);
        let unit2Exists = Object.keys(this.state.ownedIngredients).filter(id => id === key)[0];

        if (unit2Exists){
          let arr = this.state.ownedIngredients[unit2Exists].split(" ");
          let unit2 = arr[1];
          let amount2 = unitToBasic(arr[0], arr[1]);

          let finalAmount = "0";
          let finalUnit = "g";

          if (["g", "kg", "dkg"].includes(unit1) && ["g", "kg", "dkg"].includes(unit2)){
              unit1 = "g";
              unit2 = "g";

            finalAmount = amount1 + amount2;
            finalUnit = "g";
            if (finalAmount >= 1000){
              finalAmount = finalAmount/1000;
              finalUnit = "kg";
            }

          } else if (["ml", "dcl", "l"].includes(unit1) && ["ml", "dcl", "l"].includes(unit2)){
              unit1 = "ml";
              unit2 = "ml";

            finalAmount = amount1 + amount2;
            finalUnit = "ml";
            if (finalAmount >= 1000){
              finalAmount = finalAmount/1000;
              finalUnit = "l";
            }
          } else if (["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit1) && ["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit2)){
              unit1 = "tsp";
              unit2 = "tsp";

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
    console.log("im not supposed to be here");
  }

  handleBackPressButton(){
    if (this.state.changed && !this.state.showUnsaved){
      this.setState({
        showUnsaved: true
      });
    } else if (this.state.showUnsaved || !this.state.changed){
      this.props.navigation.goBack();
    }
  }

  render() {
    const LANG = store.getState().lang;

    const PICKER_ITEMS = Object.keys(this.state.ingredients).map(ingredient =>
                <Picker.Item key={this.state.ingredients[ingredient].key} label={this.state.ingredients[ingredient].name} value={this.state.ingredients[ingredient].name} />
            );
           PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);

    const INGREDIENTS = this.state.ingredients.filter(ing => ing.name.toLowerCase().includes(this.state.newIngredientName.toLowerCase()));

    console.log(this.state.chosenIngredients);

    return (
        <Container>
          <Header style={{ ...styles.header}}>
            <Left style={{...styles.centerVer, paddingRight: 0, zIndex: 100 }}>
              <Button transparent onPress={() => this.handleBackPressButton()}>
                <Icon name="md-close" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Col>
              <Title style={{ ...styles.headerItem, ...styles.centerVer, width: deviceWidth*0.7 }}>{textAddManually.header[LANG]}</Title>
            </Col>
            <Right  style={{zIndex: 100 }}>
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
                text: textAddManually.messageSave[LANG],
                duration: 4000,
                type: 'danger',
                onClose: () => this.setState({showUnsaved: false,})
              })
            }

                    <Card transparent style={{ ...styles.formCard}}>
                      <Grid >
                        <Row>
                          <Col size={100}>
                            <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>{textAddManually.ingList[LANG]}</Text>
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
                                            newChosenIngredients[key].amount = text;

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
                                                        newChosenIngredients[key].unit = itemValue;

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

                                   <Picker.Item key="6" label={LANG === 0 ? "ks" : "pcs"} value={LANG === 0 ? "ks" : "pcs"}/>

                                   <Picker.Item key="7" label={LANG === 0 ? "čl" : "tsp"} value={LANG === 0 ? "čl" : "tsp"}/>
                                   <Picker.Item key="8" label={LANG === 0 ? "pl" : "tbsp"} value={LANG === 0 ? "pl" : "tbsp"}/>

                                   <Picker.Item key="9" label={LANG === 0 ? "šálka" : "cup"} value={LANG === 0 ? "šálka" : "cup"}/>
                                  </Picker>
                                </Item>
                              </Col>

                            </Row>
                         )}

                         <Row><Text>{"  "}</Text></Row>
                             <Row>
                               <Col size={100}>
                               <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>{textAddManually.addIng[LANG]}</Text>
                               </Col>
                             </Row>

                             <Row size={10}>
                               <Col size={35}>
                                 <Text style={{ ...styles.DARK_PEACH }}>{textAddManually.name[LANG]}</Text>
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
                                   <Text style={{ ...styles.DARK_PEACH }}>{textAddManually.amount[LANG]}</Text>
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
                                    <Text style={{ ...styles.DARK_PEACH }}>{textAddManually.unit[LANG]}</Text>
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

                                        <Picker.Item key="6" label={LANG === 0 ? "ks" : "pcs"} value={LANG === 0 ? "ks" : "pcs"}/>

                                        <Picker.Item key="7" label={LANG === 0 ? "čl" : "tsp"} value={LANG === 0 ? "čl" : "tsp"}/>
                                        <Picker.Item key="8" label={LANG === 0 ? "pl" : "tbsp"} value={LANG === 0 ? "pl" : "tbsp"}/>

                                        <Picker.Item key="9" label={LANG === 0 ? "šálka" : "cup"} value={LANG === 0 ? "šálka" : "cup"}/>
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
