import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Content, Text, List, ListItem, Icon, Container, Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';

import { rebase } from '../../index.android';
import store from "../store/index";

import styles from '../style';

export default class Sidebar extends Component {

  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
      showStuff: false,

      inventories: [],
    };


  this.fetch.bind(this);
  this.fetch();
  }

  fetch(){
    const USER_ID = store.getState().user.uid;

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
        let accessGranted = invAcc.filter(inventoryAcc => inventoryAcc.userID === USER_ID).map(invAcc => invAcc.invID.toString());
        let availableInv = inv.filter(inventory => accessGranted.includes(inventory.key));
        this.setState({
          inventories: availableInv,
        })
      });
    });
  }

  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={styles.sidebar}
        >
        <List>
          <ListItem button noBorder onPress={() => { this.props.closeDrawer(); this.props.navigation.navigate('Recipes'); }} >
            <Left>
              <Icon active name='md-book' style={styles.sidebarIcon} />
              <Text style={styles.text}>Recepty</Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>

          <ListItem button noBorder onPress={() => {this.setState( {showStuff:!this.state.showStuff}) }} >
            <Left>
              <Icon active name='md-basket' style={styles.sidebarIcon} />
              <Text style={styles.text}>Inventáre</Text>
            </Left>

          </ListItem>
          {
            this.state.showStuff &&
              <List
              dataArray={this.state.inventories} renderRow={data =>
                <ListItem button noBorder  onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Recipes'); }}>
                  <Left>
                    <Thumbnail
                      style={styles.stretch}
                      source={require('../helperFiles/sushi.jpg')}
                    />
                  <Text style={styles.text}>{data.name}</Text>
                  </Left>
                </ListItem> } />
              }

              {
                this.state.showStuff &&
                    <Button block style={{ ...styles.sidebarAddInvButton}}  onPress={()=>{ Actions.addInv(); this.props.closeDrawer();}} >
                     <Icon active name='md-add' style={{ ...styles.sidebarAddInvIcon}} />
                    </Button>
              }

              <ListItem  noBorder >
              </ListItem>

            <ListItem button noBorder onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Settings');}} >
              <Left>
                <Icon active name='md-settings' style={styles.sidebarIcon} />
                <Text style={styles.text}>Nastavenia</Text>
              </Left>
              <Right style={{ flex: 1 }}>
              </Right>
            </ListItem>
        </List>

        </Content>
      </Container>
    );
  }
}

/*

<List>




      {
        this.state.showStuff &&
            <Button block style={{ backgroundColor: ACC_PEACH }}  onPress={()=>{ this.props.navigation.goBack(); this.props.closeDrawer();}} >
             <Icon active name='md-add' style={{ color: ACC_VIO, fontSize: 26}} />
            </Button>
      }

      <ListItem  noBorder >
      </ListItem>

    <ListItem button noBorder onPress={()=>{ this.props.navigation.goBack(); this.props.closeDrawer();}} >
      <Left>
        <Icon active name='md-settings' style={styles.sidebarIcon} />
        <Text style={styles.text}>Nastavenia</Text>
      </Left>
      <Right style={{ flex: 1 }}>
      </Right>
    </ListItem>
</List>

*/

/*
<View>
  <Text>RECIPEEEEES</Text>
    <Button
      onPress={() => {
        Alert.alert('You tapped the button!');
      }}
      title="Press Me"
    />

    <Button
      title="Go back"
      onPress={() => this.props.navigation.goBack()}
    />

    <Button
      title="Go to Recipes... again"
      onPress={() => this.props.navigation.push('Recipes')}
    />
</View>

*/
