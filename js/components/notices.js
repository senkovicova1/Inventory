import React, {Component} from 'react';
import {Image, Platform, BackHandler, AppRegistry, StyleSheet, TouchableOpacity, View, Dimensions} from 'react-native';
import { Drawer,  Card, Content, Header, Body, Title, Text, List, Input, Item, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, Col, Row, Grid, StyleProvider, getTheme, variables } from 'native-base';
import Modal from "react-native-modal";
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';

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
    };

    this.handleBackPress.bind(this);
    this.toggleModal.bind(this);
    this.fetch.bind(this);
    this.fetch();
  }

  fetch(){
    rebase.fetch(`users`, {
      context: this,
      withIds: true,
    }).then((u) => {
      console.log(u);
        this.setState({
          users: u,
        });
    });

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
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


  handleBackPress = () => {
    if (this.state.modalVisible){
      this.setState({
        modalVisible: false,
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
    if(this.state.users && Object.values(this.state.users).length > 0){
      console.log("ugh");
      console.log(Object.keys(this.state.users[store.getState().user.uid].notices));
    }
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
                     <Title style={{ ...styles.headerItem }}>Správy</Title>

               </Body>
           </Header>

         <Content padder style={{ ...styles.content }} >

            <Card transparent style={{ ...styles.listCardInv }}>
               {/*this.state.users
                 &&
                 Object.keys(this.state.users.length) > 0
                 &&
                 <List
                 dataArray={Object.keys(this.state.users[store.getState().user.uid].notices).map(k => this.state.users[store.getState().user.uid].notices.k)}
                 renderRow={data =>
                   <ListItem button style={{...styles.listItem}} noBorder onPress={() => this.toggleModal(true)}>
                     <Left>
                       <Text style={{ ...styles.listText }}>{data.userId}</Text>
                     </Left>
                     <Right>
                     </Right>
                   </ListItem>
                 }
               />*/}
           </Card>

         </Content>
       </Container>
      </Drawer>

    );
  }
}
