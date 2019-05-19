import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, CardItem, Content, Toast, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import { fb } from '../../index';
import firebase from 'firebase';
import RNFetchBlob from 'rn-fetch-blob'

import store from "../store/index";

import styles from '../style';

const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

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

export default class EditRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
       showID: false,
       name: this.props.navigation.getParam('name', 'NO-ID'),
       key: this.props.navigation.getParam('keyy', 'NO-ID'),
       body: this.props.navigation.getParam('body', 'NO-ID'),
       ingredientsInRecipe: this.props.navigation.getParam('ingredients', 'NO-ID'),
       image: this.props.navigation.getParam('image', 'NO-ID'),
       userID: 1,

       ingredients: [],
       chosenIgredientsName: {},
       chosenIgredientsAmount: {},
       chosenIgredientsUnit: {},

       newIngredientName: "",
       newIngredientAmount: "",
       newIngredientUnit: "",

       takePic: false,
       searchOpen: false,
       showUnsaved: false,
       changed: false,
    };

      this.uploadImage.bind(this);
      this.handleBackPress.bind(this);
      this.handleBackPressButton.bind(this);

      this.checkNumber.bind(this);

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

   submit(url){
       let ings = {};
       Object.keys(this.state.ingredientsInRecipe).map(key =>
         ings[this.state.ingredientsInRecipe[key].key] = this.state.ingredientsInRecipe[key].amount);

       rebase.update(`recipes/${this.state.key}`, {
         data: {name: this.state.name, body: this.state.body, ingredients: ings, image: url}
       });

       let rec = {
         name: this.state.name,
         key: this.state.key,
         body: this.state.body,
         ingredients: ings,
         image: url,
       }

     this.props.navigation.push("Recipe", {rec: rec});
   }

   addNewIngredient(){
     if (this.state.newIngredientName.length > 0
     && this.state.newIngredientUnit.length > 0
     && this.state.newIngredientAmount.length > 0){
       let key = this.state.ingredients.filter(ing => ing.name === this.state.newIngredientName)[0].key;
       let object = {key: key, name: this.state.newIngredientName, amount: this.state.newIngredientAmount + " " + this.state.newIngredientUnit};
       let newIngredientsInRecipe = [...this.state.ingredientsInRecipe, object];
  //     newIngredientsInRecipe[Object.keys(newIngredientsInRecipe).length] = object,
         this.setState({
           ingredientsInRecipe: newIngredientsInRecipe,

           newIngredientName: "",
           newIngredientUnit: "",
           newIngredientAmount: "",

           changed: true,
         });
     }
   }

   removeIngredient(key){
     let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
     delete newIngredientsInRecipe[key];
       this.setState({
         ingredientsInRecipe: [...newIngredientsInRecipe],
         changed: true,
       });

   }

   checkNumber(text){
     return !isNaN(text) && !isNaN(parseFloat(text));
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

     uploadImage(mime = 'image/png') {
       console.log("UPLOADING");
         let uploadBlob = null;
         console.log(this.state.image);
         let uploadUri = this.state.image;

         const imageRef = fb.storage().ref('recipes').child(this.state.key);

         fs.readFile(uploadUri, 'base64')
           .then((data) => {
             console.log("first -- data:");
             console.log(data);
             return Blob.build(data, { type: `${mime};BASE64` });
           })
           .then((blob) => {
             console.log("second -- blob:");
             console.log(blob);
             uploadBlob = blob;
             return imageRef.put(blob, { contentType: mime });
           })
           .then(() => {
             console.log("third -- null");
             uploadBlob.close();
             return imageRef.getDownloadURL();
           })
           .then((url) => {
             console.log("4th -- url");
             console.log(url);
             this.submit(url);
           })
           .catch((error) => {
             console.log("5th -- error");
             console.log(error);
         });
     }

  render() {
    console.log(this.state.ingredientsInRecipe);
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
                <Button transparent onPress={() => this.handleBackPressButton()}>
                  <Icon name="md-close" style={{ ...styles.headerItem }}/>
                </Button>
              </Left>
              <Body>
                <Title style={{ ...styles.headerItem }}>Edit Recipe</Title>
              </Body>
            </Header>

            <Content style={{ ...styles.content }} >
              {this.state.name.length === 0
                &&
                <Button  bordered block warning style={{ ...styles.acordionButtonTrans }} onPress={()=> this.setState({showEmpty: true})}>
                    <Text style={{ ...styles.acordionButtonTextTrans }}> Edit </Text>
                </Button>
              }

              {this.state.name.length > 0
                &&
                <Button block style={{ ...styles.acordionButton }} onPress={()=> this.uploadImage()}>
                    <Text style={{ ...styles.acordionButtonText }}> Edit</Text>
                </Button>
              }

            {this.state.showUnsaved
              &&
              Toast.show({
                text: `If you leave now, your changes will not be saved! If you wish to leave without saving your changes, press back button again.`,
                duration: 4000,
                type: 'danger'
              })
            }

            {this.state.showEmpty
              &&
              Toast.show({
                text: `You need to name your recipe before saving it!`,
                duration: 4000,
                type: 'danger'
              })
            }

            <Form>

                 <Input
                   style={{  ...styles.formTitle }}
                   placeholder="Enter name"
                   placeholderTextColor='rgb(255, 184, 95)'
                   value={this.state.name}
                   onChangeText={(text) => this.setState({name: text, changed: true,})}/>


               {this.state.image
                 &&
                 <Image
                   style={{ ...styles.image, ...styles.center }}
                   source={{uri: this.state.image}}
                   />
               }

               <Button block style={{ ...styles.acordionButton }} onPress={() => this.setState({takePic: !this.state.takePic})}>
                   <Text style={{ ...styles.acordionButtonText }}>{this.state.image ? "Zmeniť fotku" : "Pridať fotku"}</Text>
               </Button>


             {this.state.takePic
               &&
               <Card style={{...styles.camera, marginBottom: 0}}>
                <RNCamera
                  style={{marginTop: -140}}
                  type={RNCamera.Constants.Type.back}
                  flashMode={RNCamera.Constants.FlashMode.auto}
                  captureAudio={false}
                  ratio='1:1'
                  permissionDialogTitle={'Permission to use camera'}
                  permissionDialogMessage={'We need your permission to use your camera phone'}
                >
                  {({ camera, status, recordAudioPermissionStatus }) => {
                    if (status !== 'READY') return <PendingView />;
                    return (
                        /*<Button onPress={() => this.takePicture(camera)} style={{...styles.acordionButton, marginBottom: deviceWidth*(-0.68)}}>
                          <Text style={{ ...styles.acordionButtonText, }}> Odfotiť </Text>
                        </Button>*/
                          <Button onPress={() => this.takePicture(camera)} style={{...styles.acordionButton, marginTop: 290}}>
                            <Text style={{ ...styles.acordionButtonText, }}> Odfotiť </Text>
                          </Button>
                    );
                  }}
                </RNCamera>
              </Card>

             }


               <Card transparent style={{ ...styles.formCard}}>
                 <Grid >
                   <Row>
                     <Col size={100}>
                       <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>Ingredients</Text>
                     </Col>
                   </Row>
                  {
                    Object.keys(this.state.ingredientsInRecipe).map(key =>
                      <Row size={10} >
                        <Col size={10}>
                          <Icon name='md-remove-circle' style={{ ...styles.minusIngredient, ...styles.PEACH}} onPress={() => this.removeIngredient(key)}/>
                        </Col>

                        <Col size={45}>
                        <Text style={{ ...styles.PEACH}}>{`${this.state.ingredientsInRecipe[key].name}`}</Text>
                        </Col>


                        <Col size={15}>
                          <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                              <Input
                                 style={{ ...styles.PEACH}}
                                 value={this.state.ingredientsInRecipe[key].amount.substring(0, this.state.ingredientsInRecipe[key].amount.indexOf(" "))}
                                 keyboardType='numeric'
                                 onChangeText={(text) =>{
                                     if (text.length === 0 || text === "-" || text === "--" || this.checkNumber(text)){
                                       let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
                                       let newValue = text + " " + this.state.ingredientsInRecipe[key].amount.substring(this.state.ingredientsInRecipe[key].amount.indexOf(" ")+1);
                                       newIngredientsInRecipe[key].amount = newValue;
                                       this.setState({
                                         ingredientsInRecipe: newIngredientsInRecipe,
                                         changed: true
                                       });
                                     }
                                   }
                                 }/>
                            </Item>
                         </Col>

                         <Col size={30}>
                           <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                             <Picker
                                 mode="dropdown"
                                 style={{ ...styles.unitPicker, ...styles.PEACH, height: 24 }}
                                 selectedValue={this.state.ingredientsInRecipe[key].amount.substring(this.state.ingredientsInRecipe[key].amount.indexOf(" ")+1)}
                                 onValueChange={(itemValue, itemIndex) =>{
                                                 let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
                                                 let newValue = this.state.ingredientsInRecipe[key].amount.substring(0, this.state.ingredientsInRecipe[key].amount.indexOf(" ")) + " " + itemValue;
                                                 newIngredientsInRecipe[key].amount = newValue;
                                                  this.setState({
                                                    ingredientsInRecipe: newIngredientsInRecipe,
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

                         <Col size={10}>
                           <Icon name='md-remove-circle' style={{ ...styles.minusIngredient }} onPress={() => this.removeIngredient(key)}/>

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
                        <Text style={{ ...styles.DARK_PEACH }}>Ingredient</Text>
                      </Col>

                      <Col size={65}>
                        <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                        <Picker
                          mode="dropdown"
                          style={{ ...styles.unitPicker, ...styles.PEACH, height: 24  }}
                          selectedValue={this.state.newIngredientName}
                          onValueChange={(itemValue, itemIndex) =>
                                            this.setState({
                                              newIngredientName: itemValue,
                                              changed: true
                                            })
                          }>
                            {PICKER_ITEMS}
                        </Picker>
                        </Item>
                      </Col>
                    </Row>

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
                                  if (text === "-" || text === "--" || this.checkNumber(text)){
                                    this.setState({
                                      newIngredientAmount: text,
                                      changed: true
                                    });
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
                          </Item>
                        </Col>
                      </Row>

                         {(this.state.newIngredientName.length > 0 && this.state.newIngredientAmount.length > 0 && this.state.newIngredientUnit.length > 0)
                           &&
                         <Row size={10}>
                           <Col size={10}>
                            <Icon name='md-add' style={{ ...styles.minusIngredient }} onPress={this.addNewIngredient.bind(this)}/>
                          </Col>
                         </Row>
                         }
                       </Grid>
                     </Card>

                     <Card transparent style={{ ...styles.formCard}}>
                         <Text style={{ ...styles.stepsCardHeader}}> Steps</Text>
                        <Textarea
                         rowSpan={5}
                         bordered
                         placeholder="Steps"
                         placeholderTextColor='rgb(255, 184, 95)'
                         style={{...styles.textArea}}
                         onChangeText={(text) => this.setState({body: text, changed: true})}
                         value={this.state.body}/>
                     </Card>
                </Form>

            </Content>
          </Container>
      </Drawer>
    );
  }
}
