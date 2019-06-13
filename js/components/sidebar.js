import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Content, Text, List, ListItem, Card, Icon, Container, Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';

import { rebase } from '../../index';
import store from "../store/index";

import {textSidebar} from '../helperFiles/dictionary';

import styles from '../style';

export default class Sidebar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
      showStuff: false,
      showTrash: false,

      inventories: [],
    };

  }

  componentDidMount() {
      rebase.bindToState(`inventories`, {
       context: this,
       state: 'inventories',
       asArray: true,
     });
  }

  render() {
    const LANG = store.getState().lang;
    const INV = this.state.inventories.filter(inventory => Object.values(inventory.owners).includes(store.getState().user.uid));
    return (
      <Container>
        <Content
          bounces={false}
          style={styles.sidebar}
        >

        <List style={{ ...styles.sidebarList}}>
          <ListItem button noBorder onPress={() => { this.props.closeDrawer(); this.props.navigation.navigate('Recipes'); }} >
            <Left>
              <Icon active name='md-book' style={styles.sidebarIcon} />
              <Text style={styles.text}>{textSidebar.recipes[LANG]}</Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>

          <ListItem button noBorder onPress={() => {this.setState( {showStuff:!this.state.showStuff}) }} >
            <Left>
              <Icon active name='md-basket' style={styles.sidebarIcon} />
              <Text style={styles.text}>{textSidebar.inv[LANG]}</Text>
            </Left>
          </ListItem>

          {
            this.state.showStuff &&
                <Button block style={{ ...styles.sidebarAddInvButton}}  onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('AddInventory');}} >
                  <Icon active name='md-add' style={{ ...styles.sidebarAddInvIcon}} />
                </Button>
          }
          {
            this.state.showStuff &&
                <Card style={{ ...styles.sidebarInvList}} transparent >
                  <List
                  dataArray={INV}
                  renderRow={data =>
                    <ListItem  style={{...styles.sidebarInvItem}} noBorder  onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Inventory', {title: data.name, id: data.key, notes: data.notes, owners: data.owners}); }}>
                      <Left>
                        <Thumbnail
                          style={styles.stretchLogo}
                          source={require('../helperFiles/logoInvTrans.png')}
                        />
                      <Text style={styles.text}>{data.name}</Text>
                      </Left>
                    </ListItem> } />
                </Card>
              }

          </List>

          <ListItem button noBorder style={{...styles.sidebarMail}} onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Notices');}} >
            <Left>
              <Icon active name='md-mail' style={{...styles.sidebarIcon}} />
              <Text style={{...styles.text}}>{textSidebar.messages[LANG]}</Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>

          <ListItem button noBorder style={{...styles.sidebarSettings}} onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Settings');}} >
            <Left>
              <Icon active name='md-settings' style={{...styles.sidebarIcon}} />
              <Text style={{...styles.text}}>{textSidebar.settings[LANG]}</Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>

        </Content>
      </Container>
    );
  }
}
