import React, {Component} from 'react';
import {Image, Platform, BackHandler} from 'react-native';
import { Toast, Drawer,  Content, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import {textAddInventory} from '../helperFiles/dictionary';

import store from "../store/index";

import styles from '../style';

export default class AddInventory extends Component {

  constructor(props) {
    super(props);
    this.state = {
      title: "",
      notes: "",

      showUnsaved: false,
      showUnnamed: false,
      changed: false,
     };

     this.handleBackPress.bind(this);

     this.submit.bind(this);
   }

   submit(){
      const USER_ID = store.getState().user.uid;
      let id = Date.now().toString(16).toUpperCase();

      let own = {};
      own[id] = USER_ID;

      rebase.post(`inventories/${id}`, {
        data: {name: this.state.title, notes: this.state.notes, owners: own}
      });

      this.props.navigation.navigate('Inventory', {id: id, title: this.state.title, notes: this.state.notes});
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

  render() {
    const LANG = store.getState().lang;
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
                <Title style={{ ...styles.headerItem }}>{textAddInventory.header[LANG]}</Title>
              </Body>
              <Right>
                { (this.state.title.length > 0)
                  &&
                <Button transparent><Icon name="md-checkmark" style={{ ...styles.headerItem }} onPress={()=> this.submit()} /></Button>
                }
            </Right>
            </Header>

            <Content padder style={{ ...styles.content }} >

              {this.state.showUnsaved
                &&
                Toast.show({
                  text: textAddInventory.messageSave[LANG],
                  duration: 4000,
                  type: 'danger',
                  onClose: () => this.setState({showUnsaved: false,})
                })
              }

             <Label style={{ ...styles.formInvTitle }}>{textAddInventory.name[LANG]}</Label>
             <Input
               style={{ ...styles.genericInput}}
               value={this.state.title}
               onChangeText={(text) => this.setState({title: text, changed: true})}/>


             <Label style={{ ...styles.formInvNotes }}>{textAddInventory.notes[LANG]}</Label>
             <Textarea
               rowSpan={6}
               style={{ ...styles.genericInput }}
               bordered
               value={this.state.notes}
               onChangeText={(text) => this.setState({notes: text, changed: true})} />


          </Content>
        </Container>
      </Drawer>
    );
  }
}
