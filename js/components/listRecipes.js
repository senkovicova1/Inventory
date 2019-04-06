import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View} from 'react-native';
import { Drawer,  Card, Content, Header, Body, Title, Text, List, Input, Item, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, Col, Row, Grid, StyleProvider, getTheme, variables } from 'native-base';
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

export default class ListRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedInventory: "",

      searchOpen: false,
      searchedWord: '',
      addOpen: false,

      recipes: [],
      inventories: [],

      text: "nothing now",
    };


    this.handleBackPress.bind(this);
    this.toggleSearch.bind(this);
    this.toggleAdd.bind(this);
    this.onValueChange.bind(this);
    this.addItem.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    const USER_ID = store.getState().user.uid;

      rebase.fetch(`recipes`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((rec) => {
        rebase.fetch(`recipeAccess`, {
          context: this,
          withIds: true,
          asArray: true
        }).then((recAcc) => {
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
                let accGrantedRec = recAcc.filter(acc => acc.userID === USER_ID).map(acc => acc.recID);
                let accGrantedInv = invAcc.filter(inv => inv.userID === USER_ID).map(inv => inv.invID);

                this.setState({
                  recipes: rec.filter(recipe => accGrantedRec.includes(recipe.key)),
                  inventories: inv.filter(inventory => accGrantedInv.includes(inventory.key)),
                });
              })
            })
          })
        });
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
      }

      componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
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
    console.log(this.nameInput);
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
                      <Text style={{ ...styles.acordionButtonText }}>Use barcode</Text>
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
