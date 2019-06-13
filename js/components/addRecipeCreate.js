import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, CardItem, Content, Header, Toast, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
import { RNCamera } from 'react-native-camera';

import Sidebar from './sidebar';

import { rebase } from '../../index';
import { fb } from '../../index';
import firebase from 'firebase';
import RNFetchBlob from 'rn-fetch-blob'

import {textCreateRecipe} from '../helperFiles/dictionary';

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

export default class AddRecipeCreate extends Component {

  constructor(props) {
    super(props);
    this.state = {
        title: "",
        body: "",
        image: null,
        ingredients: [],
        chosenIgredientsName: {},
        chosenIgredientsAmount: {},
        chosenIgredientsUnit: {},

        newIngredientName: "",
        newIngredientAmount: "",
        newIngredientUnit: "",
        showIngredients: false,

        writtenCode: "",
        validCode: "",

        recipeIDs: [],

        takePic: false,

        searchOpen: false,

        viaCode: false,
        viaForm: false,

        showUnsaved: false,
        changed: false,
    };

    this.uploadImage.bind(this);
    this.handleBackPress.bind(this);

    this.checkNumber.bind(this);

    this.addNewIngredient.bind(this);
    this.removeIngredient.bind(this);

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

      submit(id, url){
        const USER_ID = store.getState().user.uid;

        let ings = {};
        Object.keys(this.state.chosenIgredientsName).map(key => {
          if (this.state.chosenIgredientsUnit[key] !== undefined && this.state.chosenIgredientsAmount[key] !== undefined){
            ings[key] = this.state.chosenIgredientsAmount[key] + " " + this.state.chosenIgredientsUnit[key];
          }
          return 0;
        });
        let k = Date.now().toString(16).toUpperCase();
        let own = {};
        own[k] = USER_ID;
        rebase.post(`recipes/${id}`, {
          data: {name: this.state.title, body: this.state.body, ingredients: ings, image: url, owners: own}
        }).then(() => {
          this.setState({
            title: "",
            body: "",
            image: null,
            ingredients: [],
            chosenIgredientsName: {},
            chosenIgredientsAmount: {},
            chosenIgredientsUnit: {},

            newIngredientName: "",
            newIngredientAmount: "",
            newIngredientUnit: "",
            showIngredients: false,

            writtenCode: "",
            validCode: "",

            recipeIDs: [],

            takePic: false,

            searchOpen: false,

            viaCode: false,
            viaForm: false,

            showUnsaved: false,
            changed: false,
          });
          this.props.navigation.navigate('Recipes');
        });

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

      handleWrittenCode(text){
        if (this.state.recipeIDs.includes(text)){
          this.setState({
            validCode: true,
            writtenCode: text,
            changed: true
          });
        } else {
          this.setState({
            validCode: false,
            writtenCode: text,
            changed: true
          });
        }
      }

      handleTitle(text){
        this.setState({
          title: text,
          changed: true
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

            let indexExists = this.state.ingredients.filter(ing => ing.name === this.state.newIngredientName)[0];
            let index = null;

            if (!indexExists) {
              let id = Date.now().toString(16).toUpperCase();
              rebase.post(`ingredients/${id}`, {
                data: {name: this.state.newIngredientName}
              });
              index = id;
            } else {
              index = indexExists.key
            }

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

              showIngredients: false,

              changed: true
            });
        }
      }

      removeIngredient(key){
        let newChosenIingredientsName = {...this.state.chosenIgredientsName};
        delete newChosenIingredientsName[key];

        let newChosenIingredientsUnit = {...this.state.chosenIgredientsUnit};
        delete newChosenIingredientsUnit[key];

        let newChosenIingredientsAmount = {...this.state.chosenIgredientsAmount};
        delete newChosenIingredientsAmount[key];

        this.setState({
          chosenIgredientsName: newChosenIingredientsName,
          chosenIgredientsUnit: newChosenIingredientsUnit,
          chosenIgredientsAmount: newChosenIingredientsAmount,

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
        return false;
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

      let id = Date.now().toString(16).toUpperCase();

      if (this.state.image){
    //    console.log("UPLOADING");
          let uploadBlob = null;
          let uploadUri = this.state.image;

          const imageRef = fb.storage().ref('recipes').child(id);

          fs.readFile(uploadUri, 'base64')
            .then((data) => {
      //        console.log("first -- data:");
      //        console.log(data);
              return Blob.build(data, { type: `${mime};BASE64` });
            })
            .then((blob) => {
      //        console.log("second -- blob:");
      //        console.log(blob);
              uploadBlob = blob;
              return imageRef.put(blob, { contentType: mime });
            })
            .then(() => {
    //          console.log("third -- null");
              uploadBlob.close();
              return imageRef.getDownloadURL();
            })
            .then((url) => {
      //        console.log("4th -- url");
      //        console.log(url);
              this.submit(id, url);
            })
            .catch((error) => {
        //      console.log("5th -- error");
        //      console.log(error);
          });
      } else {
        this.submit(id, null);
      }

    }


  render() {

    const deviceHeight = Dimensions.get('window').height;
    const deviceWidth = Dimensions.get('window').width;
    const PICKER_ITEMS = this.state.ingredients
                .filter(ingredient => !Object.values(this.state.chosenIgredientsName).includes(ingredient.name))
                .map(ingredient =>
                    <Picker.Item key={ingredient.key} label={ingredient.name} value={ingredient.name} />
                );
    PICKER_ITEMS.unshift(<Picker.Item key="0" label="" value=""/>);

    const INGREDIENTS = this.state.ingredients.filter(ing => ing.name.toLowerCase().includes(this.state.newIngredientName.toLowerCase()) && !Object.values(this.state.chosenIgredientsName).includes(ing.name));

    const LANG = store.getState().lang;

    return (

        <Container>
            <Header style={{ ...styles.header}}>
              <Left>
                <Button transparent onPress={() => this.props.navigation.goBack()}>
                  <Icon name="md-close" style={{ ...styles.headerItem }}/>
                </Button>
              </Left>
              <Body>
                <Title style={{ ...styles.headerItem }}>{textCreateRecipe.header[LANG]}</Title>
              </Body>
              <Right>
            </Right>

            </Header>

            <Content style={{ ...styles.content }} >

              {this.state.title.length === 0
                &&
                <Button  bordered block warning style={{ ...styles.acordionButtonTrans }} onPress={()=> this.setState({showEmpty: true})}>
                    <Text style={{ ...styles.acordionButtonTextTrans }}> {textCreateRecipe.create[LANG]}</Text>
                </Button>
              }

              {this.state.title.length > 0
                &&
                <Button block style={{ ...styles.acordionButton }} onPress={() => this.uploadImage()}>
                    <Text style={{ ...styles.acordionButtonText }}> {textCreateRecipe.create[LANG]}</Text>
                </Button>
              }

              {this.state.showUnsaved
                &&
                Toast.show({
                  text: textCreateRecipe.messageSave[LANG],
                  duration: 4000,
                  type: 'danger'
                })
              }

              {this.state.showEmpty
                &&
                Toast.show({
                  text: textCreateRecipe.messageName[LANG],
                  duration: 4000,
                  type: 'danger'
                })
              }

                <Form>
                    <Input
                      style={{ ...styles.formTitle }}
                      placeholder={textCreateRecipe.titlePlaceholder[LANG]}
                      placeholderTextColor='rgb(255, 184, 95)'
                      onChangeText={(text) => this.handleTitle(text)}/>

                {this.state.image
                  &&
                  <Image
                    style={{ ...styles.image, ...styles.center }}
                    source={{uri: this.state.image}}
                    />
                }

                <Button  style={{ ...styles.acordionButton }} onPress={() => this.setState({takePic: !this.state.takePic})}>
                    <Text style={{ ...styles.acordionButtonText }}>{this.state.image ? textCreateRecipe.changePhoto[LANG]: textCreateRecipe.addPhoto[LANG]}</Text>
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
                             <Text style={{ ...styles.acordionButtonText, }}> {textCreateRecipe.snap[LANG]} </Text>
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
                          <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>{textCreateRecipe.ingList[LANG]}</Text>
                        </Col>
                      </Row>
                      {
                        Object.keys(this.state.chosenIgredientsName).map(key =>
                        <Row>
                          <Col size={90}>
                          <Text style={{ ...styles.PEACH}}>{`${this.state.chosenIgredientsName[key]}  ${this.state.chosenIgredientsAmount[key]} ${this.state.chosenIgredientsUnit[key]}`}</Text>
                          </Col>
                          <Col size={10}>
                            <Icon name='md-remove-circle' style={{ ...styles.minusIngredient, ...styles.PEACH}} onPress={() => this.removeIngredient(key)}/>
                          </Col>
                        </Row>
                      )
                    }

                    <Row><Text>{"  "}</Text></Row>

                      <Row>
                        <Col size={100}>
                        <Text style={{ ...styles.DARK_PEACH, borderBottomWidth: 2, borderColor: 'rgb(255, 122, 90)', marginBottom: 5}}>{textCreateRecipe.addIng[LANG]}</Text>
                        </Col>
                      </Row>

                        <Row size={10}>
                          <Col size={35}>
                            <Text style={{ ...styles.DARK_PEACH }}>{textCreateRecipe.name[LANG]}</Text>
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
                            <Text style={{ ...styles.DARK_PEACH }}>{textCreateRecipe.amount[LANG]}</Text>
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
                            <Text style={{ ...styles.DARK_PEACH }}>{textCreateRecipe.unit[LANG]}</Text>
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

                                <Picker.Item key="6" label={LANG === 0 ? "ks" : "pcs"} value={LANG === 0 ? "ks" : "pcs"}/>

                                <Picker.Item key="7" label={LANG === 0 ? "čl" : "tsp"} value={LANG === 0 ? "čl" : "tsp"}/>
                                <Picker.Item key="8" label={LANG === 0 ? "pl" : "tbsp"} value={LANG === 0 ? "pl" : "tbsp"}/>

                                <Picker.Item key="9" label={LANG === 0 ? "šálka" : "cup"} value={LANG === 0 ? "šálka" : "cup"}/>
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
                      <CardItem header style={{ ...styles.textArea, height: 20}}>
                        <Text style={{ ...styles.DARK_PEACH}}>{textCreateRecipe.steps[LANG]}</Text>
                      </CardItem>
                      <Textarea
                        rowSpan={5}
                        bordered
                        placeholder={textCreateRecipe.steps[LANG]}
                        placeholderTextColor='rgb(255, 184, 95)'
                        style={{...styles.textArea}}
                        onChangeText={(text) => this.setState({body: text, changed: true})}
                        value={this.state.body}/>
                    </Card>
                </Form>



            </Content>
          </Container>
    );
  }
}
