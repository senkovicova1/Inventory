import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View} from 'react-native';
import { Drawer,  Content, Header, Body, Title, Label, Form, Item, Card, Grid, Row, Col, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, getTheme, variables } from 'native-base';
//import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
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


        showUnsaved: false,
        changed: false,
    };

    this.handleBackPress.bind(this);

    this.takePicture.bind(this);

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

              changed: false,
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

        changed: true
      });
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
      return false;
    }
  }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

/*  takePicture = async function() {
    console.log("hum?");
      if (this.camera) {
        console.log("here");
        const options = { quality: 0.5, base64: true };
        const data = await this.camera.takePictureAsync(options);
        console.log(data.uri);
      }
    };*/

  render() {
    const PICKER_ITEMS = this.state.ingredients.map(ingredient =>
                <Picker.Item key={ingredient.key} label={ingredient.name} value={ingredient.name} />
            );
           PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);
      //     console.log(this.state.ingredients);
      //     Object.keys(this.state.ingredients).map(key => console.log(this.state.chosenIngredients[key]));
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
        onClose={() => this.closeDrawer()} >
        <Container>
          <Header style={{ ...styles.header}}>
            <Left>
              <Button transparent onPress={() => this.handleBackPress()}>
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

            {this.state.showUnsaved
              &&
              Toast.show({
                text: `If you leave now, your changes will not be saved! If you wish to leave without saving your changes, press back button again.`,
                duration: 4000,
                type: 'danger'
              })
            }

            <Button block style={{ ...styles.acordionButton }} onPress={() => this.setState({viaBarcode: !this.state.viaBarcode})}>
                <Text style={{ ...styles.acordionButtonText }}>Scan barcode</Text>
            </Button>

            {
          //    this.state.viaBarcode
            //  &&
            }

        {/*    <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'black'}}>
            <RNCamera
              ref={ref => {
                console.log("uh");
                this.camera = ref;
              }}
              style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.on}
              permissionDialogTitle={'Permission to use camera'}
              permissionDialogMessage={'We need your permission to use your camera phone'}
              onGoogleVisionBarcodesDetected={({ barcodes }) => {
                console.log(barcodes);
              }}
            />
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity onPress={this.takePicture.bind(this)} style={{flex: 0, backgroundColor: '#fff', borderRadius: 5, padding: 15, paddingHorizontal: 20, alignSelf: 'center', margin: 20,}}>
                  <Text style={{ fontSize: 14 }}> SNAP </Text>
                </TouchableOpacity>
              </View>
            </View>
          */}

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
                                            changed: true
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
                                          changed: true
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
                                                 changed: true
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
                                            changed: true
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
                              newIngredientAmount: text,
                              changed: true
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
                                              newIngredientUnit: itemValue,
                                              changed: true
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
