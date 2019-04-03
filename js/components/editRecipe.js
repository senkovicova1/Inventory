import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer, Card, Content, Toast, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, StyleProvider, Col, Row, Grid, getTheme, variables } from 'native-base';
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

      this.handleBackPress.bind(this);

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
     let ings = {};
     Object.keys(this.state.ingredientsInRecipe).map(key =>
       ings[this.state.ingredientsInRecipe[key].key] = this.state.ingredientsInRecipe[key].amount);

     rebase.update(`recipes/${this.state.key}`, {
       data: {name: this.state.name, body: this.state.body, ingredients: ings, image: this.state.image}
     });

     let rec = {
       name: this.state.name,
       key: this.state.key,
       body: this.state.body,
       ingredients: ings,
       image: this.state.image,
     }

     this.props.navigation.push("Recipe", {rec: rec});
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

           changed: true,
         });
     }
   }

   removeIngredient(key){
     let newIngredientsInRecipe = {...this.state.ingredientsInRecipe};
     delete newIngredientsInRecipe[key];
       this.setState({
         ingredientsInRecipe: newIngredientsInRecipe,
         changed: true,
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

   takePicture = async function(camera) {
       const options = { quality: 0.5, base64: true };
       const data = await camera.takePictureAsync(options);
         this.setState({
           image: data.uri,
           takePic: false,
         })
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
                <Button transparent onPress={() => this.handleBackPress()}>
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

            {this.state.showUnsaved
              &&
              Toast.show({
                text: `If you leave now, your changes will not be saved! If you wish to leave without saving your changes, press back button again.`,
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
                                             changed: true
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
                                   changed: true
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
                                             newIngredientName: itemValue
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
