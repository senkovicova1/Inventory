import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer,  Card, Content, Header, Body, Title, Text, List, Input, Item, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, Col, Row, Grid, StyleProvider, getTheme, variables } from 'native-base';
import Modal from "react-native-modal";
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

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

export default class ListRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedInventory: "",

      searchOpen: false,
      searchedWord: '',
      addOpen: false,

      recipes: [],
      recipeAccess: [],
      inventories: [],
      users: [],
      notices: [],

      modalVisible: false,

      text: "nothing now",
    };

    this.approveRequest.bind(this);
    this.declineRequest.bind(this);
    this.handleNewData.bind(this);
    this.handleBackPress.bind(this);
    this.toggleModal.bind(this);
    this.toggleSearch.bind(this);
    this.toggleAdd.bind(this);
    this.onValueChange.bind(this);
    this.addItem.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    const USER_ID = store.getState().user.uid;

  /*    rebase.fetch(`recipes`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((rec) => {
        rebase.fetch(`recipeAccess`, {
          context: this,
          withIds: true,
          asArray: true
        }).then((recAcc) => {*/
          rebase.fetch(`inventories`, {
            context: this,
            withIds: true,
            asArray: true
          }).then((inv) => {
            rebase.fetch(`inventoryAccess`, {
              context: this,
              withIds: true,
              asArray: true
            }).then((invAcc) => {
              rebase.fetch(`users`, {
                context: this,
                withIds: true,
                asArray: true
              }).then((u) => {
            //      let accGrantedRec = recAcc.filter(acc => acc.userID === USER_ID).map(acc => acc.recID);
                  let accGrantedInv = invAcc.filter(inv => inv.userID === USER_ID).map(inv => inv.invID);
                  this.setState({
            //        recipes: rec.filter(recipe => accGrantedRec.includes(recipe.key)),
                    inventories: inv.filter(inventory => accGrantedInv.includes(inventory.key)),
                    users: u,
                  });
                })
              })
            });
      /*    })
        });*/
    }

    addItem(newItem){
      this.setState({
        recipes: this.state.recipes.concat([newItem]) //updates Firebase and the local state
      });
    }

    toggleSearch(){
      this.setState({
        searchOpen: !this.state.searchOpen,
      });
    }

    onValueChange(value: string) {
      this.setState({
        selected: value
      });
    }

    toggleAdd(){
      this.setState({
        addOpen: !this.state.addOpen,
      });
    }

    componentWillReceiveProps(){
      this.fetch();
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        this.ref2 = rebase.listenTo(`recipes`, {
          context: this,
          asArray: true,
          then: function(rec){
              this.handleNewData(rec, []);
          }
        });
        this.ref3 = rebase.listenTo(`recipeAccess`, {
          context: this,
          asArray: true,
          then: function(recAcc){
            this.handleNewData([], recAcc);
            }
        });

        rebase.bindToState(`users/${store.getState().user.uid}/notices`, {
         context: this,
         state: 'notices',
         asArray: true,
         then: function(notices){
           this.setState({
             modalVisible: (this.state.notices.filter(note => !note.seen).length > 0),
           });
         }
       });
    }

      componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
      }

      handleNewData(rec, recAcc){
      //  console.log("this is it");
        if ( recAcc.length > 0 && this.state.recipes.length > 0){

          console.log("adding recAcc");
          console.log(recAcc);
          console.log(this.state.recipes);
          const USER_ID = store.getState().user.uid;

          let accGrantedRec = recAcc.filter(acc => acc.userID === USER_ID).map(acc => acc.recID);
          console.log(accGrantedRec);
          let newRecipes = this.state.recipes.filter(recipe => accGrantedRec.includes(recipe.key));
          console.log(newRecipes);

          this.setState({
            recipes: newRecipes,
          });

        } else if (rec.length > 0 && this.state.recipeAccess.length > 0){

      //    console.log("adding rec");
    //      console.log(rec);
    //      console.log(this.state.recipeAccess);
          const USER_ID = store.getState().user.uid;

          let accGrantedRec = this.state.recipeAccess.filter(acc => acc.userID === USER_ID).map(acc => acc.recID);
          console.log(accGrantedRec);
          let newRecipes = rec.filter(recipe => accGrantedRec.includes(recipe.key));
          console.log(newRecipes);

          this.setState({
            recipes: newRecipes,
          });

        } else if (rec.length > 0){
          this.setState({
            recipes: rec
          });

        } else {
          this.setState({
            recipeAccess: recAcc
          });
        }
      }

      toggleModal(visible) {
    /*    rebase.update(`users/${this.state.showRecipes}/notices/RR-${id}`, {
          data: {userID: this.state.showRecipes, recID: key, approved: false, seen: false}
        }).then(newLocation => {
            rebase.post(`users/${store.getState().user.uid}/notices/RRM-${id}`, {
              data: {recID: key, approved: false,}
            }).then((x) => {
              this.setState({
                message: "Recipe requested!",
                showMessage: true,
              });
            })
        });*/
          this.setState({modalVisible: visible});
      }

      approveRequest(note){
        console.log("approving");
        rebase.update(`users/${store.getState().user.uid}/notices/${note.key}`, {
          data: {approved: true, seen: true}
        }).then(newLocation => {
            rebase.update(`users/${note.userId}/notices/${note.key}`, {
              data: {approved: true,}
            }).then((x) => {
              let id = Date.now().toString(16).toUpperCase();
              let wantedRecipe = this.state.recipes.filter(rec => rec.key === note.recId)[0];
              rebase.post(`recipeAccess/${id}`, {
                data: {userID: note.userId, recID: id}
              }).then(a => {
                  rebase.post(`recipes/${id}`, {
                    data: {name: wantedRecipe.name, body: wantedRecipe.body, ingredients: wantedRecipe.ingredients, image: wantedRecipe.image}
                  });
              });
            })
        });
  //      this.toggleModal(false);
      }

      declineRequest(note){
        console.log("declining");
            rebase.update(`users/${store.getState().user.uid}/notices/RR-${note.key}`, {
              data: {approved: false, seen: true}
            }).then(newLocation => {
                rebase.update(`users/${note.userId}/notices/RRM-${note.key}`, {
                  data: {approved: false,}
                }).then((x) => {

                })
            });
    //    this.toggleModal(false);
      }


      handleBackPress = () => {
        this.props.navigation.navigate("Recipes");
        return true;
      }


    closeDrawer = () => {
      this.drawer._root.close()
    };
    openDrawer = () => {
      this.drawer._root.open()
    };

/*    takePicture = async function() {
      console.log("hum?");
        if (this.camera) {
          this.setState({searchedWord: "sushi"});
          console.log("here");
          const options = { quality: 0.5, base64: true };
          const data = await this.camera.takePictureAsync(options);
          console.log(data.uri);
        }
      };*/


    takePicture = async function(camera) {
        const options = { quality: 0.5, base64: true };
        const data = await camera.takePictureAsync(options);
        //  eslint-disable-next-line
        this.setState({text: data.uri});
//        console.log(data.uri);
      };

  render() {
//    console.log(this.state);
    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
        onClose={() => this.closeDrawer()} >

        <Container>
           <Header style={{ ...styles.header }}>

               <Left>
                 <Button transparent  onPress={() => this.openDrawer()}>
                   <Icon name="menu" style={{ ...styles.headerItem }}/>
                 </Button>
               </Left>

               <Body >
                 { this.state.searchOpen
                 &&
                   <Input
                     autoFocus
                     style={{ ...styles.headerItem}}
                     placeholder="zadajte hľadaný výraz"
                     placeholderTextColor='rgb(0, 170, 160)'
                     onChangeText={(text) => this.setState({searchedWord: text})}/>
                 }
                 {!this.state.searchOpen
                   &&
                     <Title style={{ ...styles.headerItem }}> Recepty</Title>
                 }
               </Body>

               <Button transparent onPress={this.toggleSearch.bind(this)} >
                   <Icon name="search" style={{ ...styles.headerItem }} />
               </Button>

           </Header>

         <Content padder style={{ ...styles.content }} >

{ (this.state.notices.length > 0
  && this.state.users.length > 0
  && this.state.notices.filter(note => !note.seen && note.key.includes("RR-")).length > 0)
  &&
            <Modal
              style={{ ...styles.listCard, backgroundColor: 'rgb(124, 90, 150)', width: deviceWidth*0.8, marginTop: deviceHeight*0.2, marginBottom: deviceHeight*0.2, alignSelf: 'center' }}
              isVisible={this.state.modalVisible}
              backdropOpacity={0.4}
              onBackButtonPress={() => this.toggleModal(false)}
              onBackdropPress={() => this.toggleModal(false)}>

                <Text style={{ ...styles.listText, color: 'rgb(255, 184, 95)' }}> {(this.state.notices.filter(note => !note.seen && note.key.includes("RR-")).length > 0  ? "You have new messages!" : "You have no new messages.")}</Text>
                {
                  this.state.notices
                    .filter(note => !note.seen && note.key.includes("RR-"))
                    .map(note =>
                      { let user = this.state.users.filter(user => user.key === note.userId)[0];
                        let recipe = this.state.recipes.filter(rec => rec.key === note.recId)[0];
                       return(
                         <Grid style={{ borderRadius: 15, backgroundColor: 'rgb(104, 70, 130)', width: deviceWidth*0.76, alignSelf: 'center' }}>
                            <Text style={{ ...styles.listText }}>
                              {`${user.username} requested a copy of this recipe:`}
                            </Text>
                          <Row style={{ height: deviceHeight*0.05,  }}>
                            <Col size={20}>
                              <Thumbnail
                                style={{ ...styles.stretch }}
                                source={{uri: recipe.image}}
                              />
                            </Col>
                            <Col size={80}>
                              <Text style={{ ...styles.listText }}>{recipe.name}</Text>
                            </Col>
                          </Row>
                          <Row style={{ height: deviceHeight*0.05}}>
                            <Col size={50}>
                              <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.declineRequest(note)} >
                                <Text style={{ ...styles.acordionButtonText }}>Decline</Text>
                              </Button>
                            </Col>
                            <Col size={50}>
                              <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.approveRequest(note)} >
                                <Text style={{ ...styles.acordionButtonText }}>Approve</Text>
                              </Button>
                           </Col>
                          </Row>
                        </Grid>
                      )}
                    )
                }



            </Modal>

          }


           <Card transparent style={{ ...styles.listCardInv }}>
             <Text style={{ ...styles.listCardInvText, marginLeft:15 }}>Varí sa z inventára </Text>
             <Picker
                mode="dropdown"
                style={{ ...styles.picker }}
                selectedValue={this.state.selected}
                onValueChange={this.onValueChange.bind(this)}
              >
                { this.state.inventories
                  .map(i =>
                         <Picker.Item key={i.key} label={i.name} value={i.key}/>
                       )
                }
              </Picker>
           </Card>

           {!this.state.addOpen
             &&
            <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> /*this.props.navigation.navigate('AddRecipe')*/ this.toggleAdd()} >
              <Icon name="md-add" style={{ ...styles.acordionButtonText }}/>
            </Button>
            }
            {this.state.addOpen
              &&
              <Button bordered full warning style={{ ...styles.acordionButtonTrans}} onPress={()=> /*this.props.navigation.navigate('AddRecipe')*/ this.toggleAdd()} >
                <Icon name="md-add" style={{ ...styles.acordionButtonText }}/>
              </Button>
            }
            {this.state.addOpen
              &&

              <Grid>
                <Row>
                  <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddRecipeBarcode')} >
                      <Text style={{ ...styles.acordionButtonText }}>Get from friend</Text>
                    </Button>
                 </Col>
                 <Col size={50}>
                    <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddRecipeCreate')} >
                      <Text style={{ ...styles.acordionButtonText }}>Create new</Text>
                    </Button>
                 </Col>
              </Row>
              </Grid>

            }

            <Card transparent style={{ ...styles.listCard }}>
               <List
                 dataArray={this.state.recipes.filter(rec => rec.name.toLowerCase().includes(this.state.searchedWord.toLowerCase()))}
                 renderRow={data =>
                   <ListItem button style={{...styles.listItem}} noBorder onPress={() => this.props.navigation.navigate('Recipe', {rec: data, userID: store.getState().user.uid}) }>
                     <Left>
                       <Thumbnail
                         style={{ ...styles.stretch }}
                         source={{uri: data.image}}
                       />
                     <Text style={{ ...styles.listText }}>{data.name}</Text></Left>
                     <Right>
                         <Badge style={{ ...styles.listTextBadge }}>
                           <Text style={{ ...styles.listTextBadgeText }}> </Text>

                       { /*   <Text style={{ color: ACC_CREAM }}>{data.id} {data.id == 1 ? "porcia" : (data.id <= 4? "porcie" : "porcií")}</Text>*/}
                      </Badge>
                     </Right>
                   </ListItem>
                 }
               />
           </Card>

         </Content>
       </Container>
      </Drawer>

    );
  }
}
/*

            <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'black'}}>
             <RNCamera
               style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center'}}
               type={RNCamera.Constants.Type.back}
               flashMode={RNCamera.Constants.FlashMode.on}
               captureAudio={false}
               permissionDialogTitle={'Permission to use camera'}
               permissionDialogMessage={'We need your permission to use your camera phone'}
               onBarCodeRead = {(e)=> this.setState({text: e.data + "  that was rada, now raw " + e.rawData})}
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





                      <Text> {this.state.text}</Text>

*/
