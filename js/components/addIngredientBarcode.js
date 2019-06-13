import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View} from 'react-native';
import {  Content, Toast,  Header, Body, Title, Label, Form, Item, Card, Grid, Row, Col, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import { rebase } from '../../index';
import firebase from 'firebase';

import {unitToBasic} from '../helperFiles/helperFunctions';

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

export default class AddIngredientBarcode extends Component {

  constructor(props) {
    super(props);
    this.state = {
      key: this.props.navigation.getParam('key', 'NO-ID'),

      ingredients: [],
      ownedIngredients: {},
      barcodes: {},

      currentBarcode: "",
      containsBarcode: false,

      newIngredient: {
        name: '',
        amount: '',
        unit: '',
        brand: '',
      },

      showUnsaved: false,
      changed: false,
    };

    this.submit.bind(this);
    this.addBarcode.bind(this);
    this.changeAmount.bind(this);

    this.handleBackPress.bind(this);
    this.handleBackPressButton.bind(this);

    this.fetch.bind(this);
    this.fetch(this.props.navigation.getParam('key', 'NO-ID'));
  }

  fetch(id){
      rebase.fetch(`ingredients`, {
        context: this,
        withIds: true,
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
          barcodes: {},

          currentBarcode: "",
          containsBarcode: false,

          newIngredient: {
            name: '',
            amount: '',
            unit: '',
            brand: '',
          },

          showUnsaved: false,
          changed: false,
        });
        this.fetch(props.navigation.getParam('key', 'NO-ID'));
      }
    }

    submit(){
      let data = {}

      Object.keys(this.state.barcodes).map(key =>{
            let unit1 = this.state.barcodes[key].unit;
            let amount1 = unitToBasic(this.state.barcodes[key].amount, unit1);
            let pieces = this.state.barcodes[key].pieces;
            let unit2Exists = Object.keys(this.state.ownedIngredients).filter(id => id === key)[0];

            if (unit2Exists){
              let arr = this.state.ownedIngredients[unit2Exists].split(" ");
              let unit2 = arr[1];
              let amount2 = amount2 = unitToBasic(arr[0], arr[1]);

              let finalAmount = "0";
              let finalUnit = "g";

              if (["g", "kg", "dkg"].includes(unit1) && ["g", "kg", "dkg"].includes(unit2)){
                unit1 = "g";
                unit2 = "g";

                finalAmount = amount1*pieces + amount2;
                finalUnit = "g";

                if (finalAmount >= 1000){
                  finalAmount = finalAmount/1000;
                  finalUnit = "kg";
                }

              } else if (["ml", "dcl", "l"].includes(unit1) && ["ml", "dcl", "l"].includes(unit2)){
                unit1 = "ml";
                unit2 = "ml";

                finalAmount = amount1*pieces + amount2;
                finalUnit = "ml";

                if (finalAmount >= 1000){
                  finalAmount = finalAmount/1000;
                  finalUnit = "l";
                }
              } else if (["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit1) && ["tsp", "tbsp", "cup", "čl", "pl", "šálka"].includes(unit2)){
                unit1 = "tsp";
                unit2 = "tsp";

                finalAmount = amount1*pieces + amount2;
                finalUnit = "tsp";

                if (finalAmount >= 15){
                  finalAmount = finalAmount/3;
                  finalUnit = "tbsp";
                } else if (finalAmount >= 48){
                  finalAmount = finalAmount/48;
                  finalUnit = "cup";
                }

              } else if (["pcs", "ks"].includes(unit1) && ["pcs", "ks"].includes(unit2)){
                finalAmount = amount1*pieces + amount2;
                finalUnit = unit2;

              } else {
                finalAmount = amount1*pieces;
                finalUnit = unit1;
              }

              data[key.toString()] = finalAmount + " " + finalUnit;

            } else {
              data[key.toString()] = ((parseInt(this.state.barcodes[key].amount) * (this.state.barcodes[key].pieces)) + " " + this.state.barcodes[key].unit);
            }
        }
      );

      rebase.update(`foodInInventory/${this.state.key}`, {
        data: data
      }).then(newLocation => {
          this.setState({
            currentBarcode: "",
            containsBarcode: false,
            barcodes: {},

            newIngredient: {
              name: '',
              amount: '',
              unit: '',
              brand: '',
            },

            changed: false,
          });
      });
      this.props.navigation.goBack();
    }

    addNewIngredientWithBarcodeToDB(){

      let newBarcodes = {...this.state.barcodes};
      newBarcodes[this.state.currentBarcode] = {...this.state.newIngredient, pieces: 1};

      let newIngredients = {...this.state.ingredients};
      newIngredients[this.state.currentBarcode] = {...this.state.newIngredient};

      rebase.update(`ingredients/${this.state.currentBarcode}`, {
        data: this.state.newIngredient
      }).then((data) => this.setState({
          barcodes: newBarcodes,
          ingredients: newIngredients,
          currentBarcode: "",
          containsBarcode: false,
          newIngredient: {
            name: '',
            amount: '',
            unit: '',
            brand: '',
          },
          changed: true,
        })
      );
    }

    removeIngredient(key){
      let newChosenIngredients = {...this.state.chosenIngredients};
      delete newChosenIngredients[key];
        this.setState({
          newChosenIngredients: chosenIngredients,

          changed: true
        });
    }

    addBarcode(code){
        if (Object.keys(this.state.ingredients).includes(code)){
          let newBarcodes = {...this.state.barcodes};
          newBarcodes[code] = {...this.state.ingredients[code], pieces: 1},
          //(Object.keys(this.state.barcodes).includes(code) ? parseInt(this.state.barcodes[code].pieces) + 1 : 1 )
          this.setState({
            barcodes: newBarcodes,
            containsBarcode: true,
          });
        } else {
          this.setState({
            currentBarcode: code,
            containsBarcode: false,
          });
        }

    }

    changeAmount(code, amount){
      let newBarcodes = {...this.state.barcodes};
      let pieces = newBarcodes[code].pieces + amount;
      newBarcodes[code].pieces = (pieces < 0 ? 0 : pieces);
      this.setState({
        barcodes: newBarcodes,
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


  takePicture = async function(camera) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      //  eslint-disable-next-line
  //    this.setState({text: data.uri});
    //    console.log(data.uri);
    };



  render() {
    const PICKER_ITEMS = Object.keys(this.state.ingredients).map(ingredient =>
                <Picker.Item key={this.state.ingredients[ingredient].key} label={this.state.ingredients[ingredient].name} value={this.state.ingredients[ingredient].name} />
            );
           PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);
    return (

        <Container>
          <Header style={{ ...styles.header}}>
            <Left>
              <Button transparent onPress={() => this.handleBackPressButton()}>
                <Icon name="md-close" style={{ ...styles.headerItem }}/>
              </Button>
            </Left>
            <Body>
              <Title style={{ ...styles.headerItem }}>Add ingredient</Title>
            </Body>
            <Right>
              <Button transparent  onPress={()=> this.submit()}><Icon name="md-checkmark"  style={{ ...styles.headerItem }} /></Button>
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

              <View>
                <Text style={{ ...styles.acordionButtonText }}> Hold barcode in front of the camera until you see information about the product.</Text>
                <Card style={{...styles.camera}}>
                 <RNCamera
                   style={{ /*flex: 1, justifyContent: 'flex-end',*/ alignItems: 'center'}}
                   type={RNCamera.Constants.Type.back}
                   flashMode={RNCamera.Constants.FlashMode.auto}
                   captureAudio={false}
                   ratio='1:1'
                   permissionDialogTitle={'Permission to use camera'}
                   permissionDialogMessage={'We need your permission to use your camera phone'}
                   onBarCodeRead = {(e)=> this.addBarcode(e.data)}
                 >
                   {({ camera, status, recordAudioPermissionStatus }) => {
                     if (status !== 'READY') return <PendingView />;
                     return (<Button></Button>);
                   }}
                 </RNCamera>
               </Card>

              {(this.state.currentBarcode.length > 0)
                &&
               <Card transparent style={{ ...styles.formCard}}>
                 <Grid>
                   {  (this.state.currentBarcode.length > 0)
                     &&
                     <Row size={10} style={{borderBottomWidth: 2, borderColor: 'rgb(255, 184, 95)'}}>
                       <Text style={{ ...styles.acordionButtonText }}> {`Barcode value: ${this.state.currentBarcode}`} </Text>
                     </Row>
                    }
                    {  (this.state.currentBarcode.length > 0 && !this.state.containsBarcode)
                      &&
                      <Row size={10} >
                        <Text style={{ ...styles.acordionButtonText }}> There is no information about this product in our database. Please fill in the missing information below. </Text>
                      </Row>
                     }
                   {  (this.state.currentBarcode.length > 0 && !this.state.containsBarcode)
                     &&
                       <Grid>
                         <Row size={10}>
                           <Col size={30}>
                             <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                               Name
                             </Text>
                           </Col>
                           <Col size={70}>
                             <Input
                              style={{ ...styles.amountInput }}
                              value={this.state.newIngredient.name}
                              onChangeText={(text) => {
                                      let newIng = {...this.state.newIngredient};
                                      newIng.name = text;
                                      this.setState({
                                        newIngredient: newIng,
                                      });
                              }}/>
                           </Col>
                         </Row>
                         <Row size={10}>
                           <Col size={30}>
                             <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                               Brand
                             </Text>
                           </Col>
                           <Col size={70}>
                             <Input
                              style={{ ...styles.amountInput }}
                              value={this.state.newIngredient.brand}
                              onChangeText={(text) => {
                                      let newIng = {...this.state.newIngredient};
                                      newIng.brand = text;
                                      this.setState({
                                        newIngredient: newIng,
                                      });
                              }}/>
                           </Col>
                         </Row>
                         <Row size={10}>
                           <Col size={30}>
                             <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                               Amount
                             </Text>
                           </Col>
                           <Col size={70}>
                             <Input
                              style={{ ...styles.amountInput }}
                              value={this.state.newIngredient.amount}
                              onChangeText={(text) => {
                                      let newIng = {...this.state.newIngredient};
                                      newIng.amount = text;
                                      this.setState({
                                        newIngredient: newIng,
                                      });
                              }}/>
                           </Col>
                         </Row>
                         <Row size={10}>
                           <Col size={30}>
                             <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                               Unit
                             </Text>
                           </Col>
                           <Col size={70}>
                             <Picker
                                mode="dropdown"
                                style={{ ...styles.unitPicker }}
                                selectedValue={this.state.newIngredient.unit}
                                onValueChange={(itemValue, itemIndex) => {
                                        let newIng = {...this.state.newIngredient};
                                        newIng.unit = itemValue;
                                        this.setState({
                                          newIngredient: newIng,
                                       });
                                }}>
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
                         </Row>

                         <Row size={10}>
                           <Icon name='md-add' style={{ ...styles.minusIngredient }} onPress={this.addNewIngredientWithBarcodeToDB.bind(this)}/>
                         </Row>
                       </Grid>
                    }
                 </Grid>
               </Card>
              }
              {(Object.keys(this.state.barcodes).length > 0)
                &&
                <Card>
                  <Button block style={{ ...styles.acordionButton }} onPress={() => this.submit()}>
                      <Text style={{ ...styles.acordionButtonText }}>Pridať produkty</Text>
                  </Button>
                  <Grid>
                    <Row size={10} style={{borderBottomWidth: 2, borderColor: 'rgb(255, 184, 95)'}}>
                      <Col size={80}>
                        <Text style={{marginLeft: 15, ...styles.DARK_PEACH}}>
                          Názov produktu
                        </Text>
                      </Col>
                      <Col size={20}>
                          <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                            Kusy
                          </Text>
                      </Col>
                    </Row>
                    {
                    Object.keys(this.state.barcodes).map(code =>{
                      return(
                          <Row size={10} style={{borderBottomWidth: 2, borderColor: 'rgb(255, 184, 95)'}}>
                            <Col size={80}>
                              <Text style={{marginLeft: 15, ...styles.DARK_PEACH}}>
                                {`${this.state.barcodes[code].name} ${this.state.barcodes[code].brand} (${this.state.barcodes[code].amount} ${this.state.barcodes[code].unit})`}
                              </Text>
                            </Col>
                            <Col size={20}>
                              <Row>
                                <Icon name='md-arrow-dropdown' onPress={() => this.changeAmount(code, -1)}/>
                                <Text style={{marginLeft: 10, ...styles.DARK_PEACH}}>
                                  {`${this.state.barcodes[code].pieces}`}
                                </Text>
                                <Icon name='md-arrow-dropup' onPress={() => this.changeAmount(code, 1)}/>
                              </Row>
                            </Col>
                          </Row>
                        )
                    })}
                  </Grid>
                </Card>
              }
             </View>


          </Content>
        </Container>
    );
  }
}
