import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer,  Card, Content, Header,Body, Title, Text, List, Input, Item, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, Col, Row, Grid, StyleProvider, getTheme, variables } from 'native-base';
import Modal from "react-native-modal";
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

import {textNotices} from '../helperFiles/dictionary';

import store from "../store/index";

import styles from '../style';

//import NotesModal from './notesModal';

const deviceHeight = Dimensions.get('window').height;
const deviceWidth = Dimensions.get('window').width;


export default class Notices extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notices: [],
      key: null,
    };

    this.handleBackPress.bind(this);
    this.toggleModal.bind(this);
    this.removeItem.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    rebase.fetch(`recipes`, {
      context: this,
      withIds: true,
    }).then((r) => {
      this.setState({
        recipes: r,
      });
    });
  }

  removeItem(key){
    rebase.remove(`users/${store.getState().user.uid}/notices/${key}`)
    .then(() => {

    })
  }

  componentDidMount() {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

      rebase.listenTo(`users`, {
       context: this,
       withIds: true,
       then: function(u){
         this.setState({
           users: u
         });
       }
      });

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  }

  toggleModal(visible, key) {
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
      this.setState({
        modalVisible: visible,
        key: key
      });
  }


  handleBackPress = () => {
    if (this.state.modalVisible){
      this.setState({
        modalVisible: false,
        key: null,
      });
    }
    this.props.navigation.navigate("Recipes");
    return true;
  }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  render() {
    const ID = store.getState().user.uid;
    const LANG = store.getState().lang;

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
                     <Title style={{ ...styles.headerItem }}>{textNotices.header[LANG]}</Title>

               </Body>
           </Header>

         <Content padder style={{ ...styles.content }} >

             <Modal
               style={{ ...styles.listCard, backgroundColor: 'rgb(124, 90, 150)', width: deviceWidth*0.8, marginTop: deviceHeight*0.2, marginBottom: deviceHeight*0.2, alignSelf: 'center' }}
               isVisible={this.state.modalVisible}
               backdropOpacity={0.4}
               onBackButtonPress={() => this.toggleModal(false, this.state.key)}
               onBackdropPress={() => this.toggleModal(false, this.state.key)}>
               {
                 this.state.key
                 &&
                 this.state.key.includes("MSG")
                 &&
                 <Grid>
                   <Row>
                     <Text>{ } </Text>
                   </Row>

                   <Row>
                     <Text style={{ ...styles.listText, color: 'rgb(255, 184, 95)', height: deviceHeight*0.07 }}>
                       {this.state.users[ID].notices[this.state.key].text}
                     </Text>
                   </Row>
                 </Grid>
               }
              </Modal>


            <Card transparent style={{ ...styles.listCard }}>
              {!(this.state.recipes
                &&
                Object.keys(this.state.recipes).length > 0
                &&
                this.state.users
                &&
                Object.keys(this.state.users).length > 0
                &&
                this.state.users[ID].notices
                &&
                Object.keys(this.state.users[ID].notices).length > 0
                )
                &&
                <Text style={{ ...styles.listText}}>
                  {textNotices.noMSG[LANG]}
                </Text>
              }
               {this.state.recipes
                 &&
                 Object.keys(this.state.recipes).length > 0
                 &&
                 this.state.users
                 &&
                 Object.keys(this.state.users).length > 0
                 &&
                 this.state.users[ID].notices
                 &&
                 Object.keys(this.state.users[ID].notices).length > 0
                 &&
                 <List
                 dataArray={Object.keys(this.state.users[ID].notices)}
                 renderRow={key =>
                     <ListItem noBorder>
                       <Left  onPress={() => this.toggleModal(true, key)}>
                        { key.includes("RR-")
                          &&
                           <Text style={{ ...styles.listText, width: deviceWidth*0.7}}>
                             {`${this.state.users[this.state.users[ID].notices[key].userID].username}` + textNotices.RR[LANG] +
`${this.state.recipes[this.state.users[ID].notices[key].recID].name}\n` +
+ textNotices.stat[LANG] + (this.state.users[ID].notices[key].approved ? textNotices.appr[LANG] : textNotices.dec[LANG])}
                           </Text>
                        }
                        { key.includes("RRM-")
                          &&
                           <Text style={{ ...styles.listText, width: deviceWidth*0.7 }}>
                             {textNotices.RRM[LANG] + `${this.state.recipes[this.state.users[ID].notices[key].recID].name}\n`
+ textNotices.stat[LANG] + (this.state.users[ID].notices[key].approved ? textNotices.appr[LANG] : textNotices.dec[LANG])}
                           </Text>
                        }
                        { key.includes("MSG-")
                          &&
                           <Text style={{ ...styles.listText, width: deviceWidth*0.7 }}>
                             {this.state.users[ID].notices[key].text.slice(0, 60)}...
                           </Text>
                        }
                      </Left>
                        <Right>
                          <Button transparent noBorder style={{height: 10, width: 40,  }} onPress={() => this.removeItem(key)}>
                            <Icon active name='md-trash' style={styles.sidebarIcon} onPress={() => this.removeItem(key)}/>
                          </Button>
                        </Right>
                     </ListItem>
                    }
               />}
           </Card>

         </Content>
       </Container>
      </Drawer>

    );
  }
}
