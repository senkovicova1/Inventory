import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View} from 'react-native';
import { Drawer,  Content, Toast,  Header, Body, Title, Label, Form, Item, Card, Grid, Row, Col, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, getTheme, variables } from 'native-base';
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

export default class AddIngredientBarcode extends Component {

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

    this.addIngredientsWithBarcode.bind(this);
    this.addBarcode.bind(this);
    this.changeAmount.bind(this);

    this.handleBackPress.bind(this);

    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
      rebase.fetch(`ingredients`, {
        context: this,
        withIds: true,
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

    addIngredientsWithBarcode(){
      let data = {}

      Object.keys(this.state.barcodes).map(key =>{
        /*  if (Object.keys(this.state.ingredients).includes(key)){
            let amount
          } else {*/
            return(data[key.toString()] = ((parseInt(this.state.barcodes[key].amount) * (this.state.barcodes[key].pieces)) + " " + this.state.barcodes[key].unit));
        //  }
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

            viaBarcode: false,
            viaForm: false,

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
          }
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
      //  eslint-disable-next-line
  //    this.setState({text: data.uri});
    //    console.log(data.uri);
    };



  render() {
  //  console.log(this.state.chosenIngredients);
    const PICKER_ITEMS = Object.keys(this.state.ingredients).map(ingredient =>
                <Picker.Item key={this.state.ingredients[ingredient].key} label={this.state.ingredients[ingredient].name} value={this.state.ingredients[ingredient].name} />
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

              <View >
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
               /*return (
               <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
               <TouchableOpacity onPress={() => this.takePicture(camera)} style={{ flex: 0, backgroundColor: '#fff', borderRadius: 5, padding: 15, paddingHorizontal: 20, alignSelf: 'center', margin: 20}}>
               <Text style={{ fontSize: 14 }}> SNAP </Text>
               </TouchableOpacity>
               </View>
               );*/

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
                  <Button block style={{ ...styles.acordionButton }} onPress={() => this.addIngredientsWithBarcode()}>
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
      </Drawer>
    );
  }
}

/*
<View style={{}}>
<Text> Hold barcode in front of camera. </Text>
 <RNCamera
   style={{ ...styles.camera}}
   type={RNCamera.Constants.Type.back}
   flashMode={RNCamera.Constants.FlashMode.on}
   captureAudio={false}
   ratio='1:1'
   permissionDialogTitle={'Permission to use camera'}
   permissionDialogMessage={'We need your permission to use your camera phone'}
   onBarCodeRead = {(e)=> this.addBarcode(e.data)}
 >
   {({ camera, status, recordAudioPermissionStatus }) => {
     if (status !== 'READY') return <PendingView />;
     return (
       <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
         <TouchableOpacity onPress={() => this.takePicture(camera)} style={{ flex: 0, backgroundColor: '#fff', borderRadius: 5, padding: 15, paddingHorizontal: 20, alignSelf: 'center', margin: 20}}>
           <Text style={{ fontSize: 14 }}> SNAP </Text>
         </TouchableOpacity>
       </View>
     );
   }}
 </RNCamera>
</View>

*/
