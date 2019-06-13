import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, CardItem, Content, Toast, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import { fb } from '../../index';
import firebase from 'firebase';
import RNFetchBlob from 'rn-fetch-blob'

import {textEditRecipe} from '../helperFiles/dictionary';

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
       key: this.props.navigation.getParam('key', 'NO-ID'),
       body: this.props.navigation.getParam('body', 'NO-ID'),
       ingredientsInRecipe: this.props.navigation.getParam('ingredients', 'NO-ID'), //pole
       image: this.props.navigation.getParam('image', 'NO-ID'),
       owners: this.props.navigation.getParam('owners', 'NO-ID'),
       userID: 1,

       ingredients: [],
       chosenIgredientsName: {},
       chosenIgredientsAmount: {},
       chosenIgredientsUnit: {},

       newIngredientName: "",
       newIngredientAmount: "",
       newIngredientUnit: "",
       showIngredients: false,

       takePic: false,
       newPic: false,
       searchOpen: false,
       showUnsaved: false,
       changed: false,

       message: "",
       showMessage: false,
    };

      this.uploadImage.bind(this);
      this.handleBackPress.bind(this);
      this.handleBackPressButton.bind(this);

      this.checkNumber.bind(this);

      this.addNewIngredient.bind(this);
      this.removeIngredient.bind(this);
      this.removeRecipe.bind(this);
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
       this.state.ingredientsInRecipe.map(ing =>
         ings[ing.key] = ing.amount);

       rebase.update(`recipes/${this.state.key}`, {
         data: {name: this.state.name, body: this.state.body, ingredients: ings, image: url || null}
       });

       let rec = {
         name: this.state.name,
         key: this.state.key,
         body: this.state.body,
         owners: this.state.owners,
         ingredients: ings,
         image: url,
       }

     this.props.navigation.push("Recipe", {key: this.state.key});
   }

   addNewIngredient(){
     if (this.state.newIngredientName.length > 0
     && this.state.newIngredientUnit.length > 0
     && this.state.newIngredientAmount.length > 0){
       let keyExists = this.state.ingredients.filter(ing => ing.name === this.state.newIngredientName)[0];
       let key = null;

       if (!keyExists) {
         let id = Date.now().toString(16).toUpperCase();
         rebase.post(`ingredients/${id}`, {
           data: {name: this.state.newIngredientName}
         });
         key = id;
       } else {
         key = keyExists.key
       }

       let object = {key: key, name: this.state.newIngredientName, amount: this.state.newIngredientAmount + " " + this.state.newIngredientUnit};
       let newIngredientsInRecipe = [...this.state.ingredientsInRecipe, object];

         this.setState({
           ingredientsInRecipe: newIngredientsInRecipe,

           newIngredientName: "",
           newIngredientUnit: "",
           newIngredientAmount: "",
           showIngredients: false,

           changed: true,

           newPic: false,
         });
     }
   }

   removeIngredient(key){
     let newIngredientsInRecipe = this.state.ingredientsInRecipe.filter(ing => ing.key !== key);

       this.setState({
         ingredientsInRecipe: newIngredientsInRecipe,
         changed: true,
       });

   }

   removeRecipe(){
       let newOwners = {...this.state.owners};
       if (Object.keys(newOwners).length === 1){
         rebase.remove(`recipes/${this.state.key}`)
         .then((x) =>
           {
             this.setState({
                 message: textEditRecipe.messageDel[LANG],
                 showMessage: true,
             })
             this.props.navigation.navigate("Recipes");
           }
         );
       } else {
           for(var f in newOwners) {
              if(newOwners[f] == store.getState().user.uid) {
                  delete newOwners[f];
              }
          }
             rebase.update(`recipes/${this.state.key}`, {
               data: {owners: newOwners}
             }).then((x) =>
             {
               this.setState({
                   message: textEditRecipe.messageDel[LANG],
                   showMessage: true,
               })
               this.props.navigation.navigate("Recipes");
             }
           );
         }
   }

   checkNumber(text){
     return !isNaN(text) && !isNaN(parseFloat(text));
   }

   takePicture = async function(camera) {
       const options = { quality: 0.5, base64: true };
       const data = await camera.takePictureAsync(options);
         this.setState({
           image: data.uri,
           takePic: false,
           newPic: true,
         })
     };

     uploadImage(mime = 'image/png') {
       if(this.state.newPic){
         let uploadBlob = null;
         let uploadUri = this.state.image;

         const imageRef = fb.storage().ref('recipes').child(this.state.key);

         fs.readFile(uploadUri, 'base64')
           .then((data) => {
             return Blob.build(data, { type: `${mime};BASE64` });
           })
           .then((blob) => {
             uploadBlob = blob;
             return imageRef.put(blob, { contentType: mime });
           })
           .then(() => {
             uploadBlob.close();
             return imageRef.getDownloadURL();
           })
           .then((url) => {
             this.submit(url);
           })
           .catch((error) => {
         });
       } else {
         this.submit(this.state.image);
       }
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

  render() {

    const PICKER_ITEMS = this.state.ingredients
                        .filter(ingredient => !(this.state.ingredientsInRecipe.map(ing => ing.key)).includes(ingredient.key))
                        .map(ingredient =>
               <Picker.Item key={ingredient.key} label={ingredient.name} value={ingredient.name} />
           );
          PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);

    const INGREDIENTS = this.state.ingredients.filter(ing => ing.name.toLowerCase().includes(this.state.newIngredientName.toLowerCase()) && !(this.state.ingredientsInRecipe.map(i => i.key)).includes(ing.key));

    const LANG = store.getState().lang;

    return (
        <Container>
            <Header style={{ ...styles.header}}>
              <Left>
                <Button transparent onPress={() => this.handleBackPressButton()}>
                  <Icon name="md-close" style={{ ...styles.headerItem }}/>
                </Button>
              </Left>
              <Body>
                <Title style={{ ...styles.headerItem }}>{textEditRecipe.header[LANG]}</Title>
              </Body>
            </Header>

            <Content style={{ ...styles.content }} >

              {this.state.showMessage
                &&
                Toast.show({
                  text: this.state.message,
                  duration: 2000,
                })
              }

              {!this.state.changed
                &&
                <Button  transparent bordered block warning style={{ ...styles.acordionButtonTrans}} onPress={()=> this.setState({showEmpty: true})}>
                    <Text style={{ ...styles.acordionButtonTextTrans }}> {textEditRecipe.edit[LANG]}</Text>
                </Button>
              }

              {this.state.changed
                &&
                <Button block style={{ ...styles.acordionButton }} onPress={()=> this.uploadImage()}>
                    <Text style={{ ...styles.acordionButtonText }}>{textEditRecipe.edit[LANG]}</Text>
                </Button>
              }

            {this.state.showUnsaved
              &&
              Toast.show({
                text: textEditRecipe.messageSave[LANG],
                duration: 3000,
                type: 'danger'
              })
            }

            {this.state.showEmpty
              &&
              Toast.show({
                text: textEditRecipe.messageName[LANG],
                duration: 3000,
                type: 'danger'
              })
            }

            <Form>
                 <Input
                   style={{  ...styles.formTitle }}
                   placeholder={textEditRecipe.titlePlaceholder[LANG]}
                   placeholderTextColor='rgb(255, 184, 95)'
                   value={this.state.name}
                   onChangeText={(text) => {
                     this.setState({name: text, changed: true,});
                   }}/>


               {this.state.image
                 &&
                 <Image
                   style={{ ...styles.image, ...styles.center }}
                   source={{uri: this.state.image}}
                   />
               }

               <Button block style={{ ...styles.acordionButton }} onPress={() => this.setState({takePic: !this.state.takePic})}>
                   <Text style={{ ...styles.acordionButtonText }}>{this.state.image ? textEditRecipe.changePhoto[LANG] : textEditRecipe.addPhoto[LANG]}</Text>
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
                          <Button onPress={() => this.takePicture(camera)} style={{...styles.acordionButton, marginTop: 290}}>
                            <Text style={{ ...styles.acordionButtonText, }}> {textEditRecipe.snap[LANG]} </Text>
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
                       <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>{textEditRecipe.ingList[LANG]}</Text>
                     </Col>
                   </Row>
                  {
                    this.state.ingredientsInRecipe.map(ing =>
                      <Row size={10} >

                        <Col size={45}>
                        <Text style={{ ...styles.PEACH}}>{`${ing.name}`}</Text>
                        </Col>


                        <Col size={15}>
                          <Item regular style={{ borderColor: 'rgb(255, 184, 95)', height: 24, borderRadius: 5, marginBottom: 5}}>
                              <Input
                                 style={{ ...styles.PEACH}}
                                 value={ing.amount.substring(0, ing.amount.indexOf(" "))}
                                 keyboardType='numeric'
                                 onChangeText={(text) =>{
                                     if (text.length === 0 || text === "-" || text === "--" || this.checkNumber(text)){
                                       let newValue = text + " " + ing.amount.substring(ing.amount.indexOf(" ")+1);

                                       let newIngredientsInRecipe = this.state.ingredientsInRecipe.map(i => {
                                         if (i.key === ing.key){
                                           let obj = {...i};
                                           obj.amount = newValue;
                                           return obj;
                                         } else {
                                           return i;
                                         }

                                       });

                                       this.setState({
                                         ingredientsInRecipe: newIngredientsInRecipe,
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
                                 selectedValue={ing.amount.substring(ing.amount.indexOf(" ")+1)}
                                 onValueChange={(itemValue, itemIndex) =>{
                                                 let newValue = ing.amount.substring(0, ing.amount.indexOf(" ")) + " " + itemValue;
                                                 let newIngredientsInRecipe = this.state.ingredientsInRecipe.map(i => {
                                                   if (i.key === ing.key){
                                                     let obj = {...i};
                                                     obj.amount = newValue;
                                                     return obj;
                                                   } else {
                                                     return i;
                                                   }

                                                 });
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

                              <Picker.Item key="6" label={LANG === 0 ? "ks" : "pcs"} value={LANG === 0 ? "ks" : "pcs"}/>

                              <Picker.Item key="7" label={LANG === 0 ? "čl" : "tsp"} value={LANG === 0 ? "čl" : "tsp"}/>
                              <Picker.Item key="8" label={LANG === 0 ? "pl" : "tbsp"} value={LANG === 0 ? "pl" : "tbsp"}/>

                              <Picker.Item key="9" label={LANG === 0 ? "šálka" : "cup"} value={LANG === 0 ? "šálka" : "cup"}/>
                             </Picker>
                           </Item>
                         </Col>

                         <Col size={10}>
                           <Icon name='md-remove-circle' style={{ ...styles.minusIngredient }} onPress={() => this.removeIngredient(ing.key)}/>

                           </Col>
                       </Row>
                    )}

                    <Row><Text>{"  "}</Text></Row>

                    <Row>
                      <Col size={100}>
                        <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>{textEditRecipe.addIng[LANG]} </Text>
                      </Col>
                    </Row>

                    <Row size={10}>
                      <Col size={35}>
                        <Text style={{ ...styles.DARK_PEACH }}>{textEditRecipe.name[LANG]} </Text>
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
                          <Text style={{ ...styles.DARK_PEACH }}>{textEditRecipe.amount[LANG]} </Text>
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
                           <Text style={{ ...styles.DARK_PEACH }}>{textEditRecipe.unit[LANG]} </Text>
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

                     <Card transparent style={{ ...styles.formCard}}>
                         <Text style={{ ...styles.stepsCardHeader}}> {textEditRecipe.steps[LANG]}</Text>
                        <Textarea
                         rowSpan={5}
                         bordered
                         placeholder={textEditRecipe.steps[LANG]}
                         placeholderTextColor='rgb(255, 184, 95)'
                         style={{...styles.textArea}}
                         onChangeText={(text) => this.setState({body: text, changed: true})}
                         value={this.state.body}/>
                     </Card>
                </Form>

                <Button  block danger style={{ ...styles.acordionButtonTrans, marginLeft: 15, marginRight: 15, marginBottom: 15}} onPress={()=> this.removeRecipe()}>
                    <Text style={{ ...styles.acordionButtonTextTrans }}> {textEditRecipe.del[LANG]} </Text>
                </Button>
            </Content>
          </Container>
    );
  }
}
