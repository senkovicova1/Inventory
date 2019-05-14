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


export default class NotesModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notices: [],

      modalVisible: false,

      text: "nothing now",
    };

    this.approveRequest.bind(this);
    this.declineRequest.bind(this);
    this.handleBackPress.bind(this);
    this.toggleModal.bind(this);
  }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);

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
      //  console.log("approving");
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
      }

      declineRequest(note){
      //  console.log("declining");
            rebase.update(`users/${store.getState().user.uid}/notices/RR-${note.key}`, {
              data: {approved: false, seen: true}
            }).then(newLocation => {
                rebase.update(`users/${note.userId}/notices/RRM-${note.key}`, {
                  data: {approved: false,}
                }).then((x) => {

                })
            });
      }

      handleBackPress = () => {
        this.setState({modalVisible: false});
        return true;
      }

  render() {

        if (this.state.notices.length > 0
          && this.state.users.length > 0
          && this.state.notices.filter(note => !note.seen && note.key.includes("RR-")).length > 0) {
            return (
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
            );
          } else {
            return ( <View></View>);
          }

  }
}
