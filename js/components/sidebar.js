import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Content, Text, List, ListItem, Card, Icon, Container, Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';

import { rebase } from '../../index';
import store from "../store/index";

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

  this.removeInv.bind(this);
  this.fetch.bind(this);
//  this.fetch();
  }

  fetch(){
    const USER_ID = store.getState().user.uid;

    rebase.fetch(`inventories`, {
       context: this,
       withIds: true,
       asArray: true
     }).then((inv) =>
         this.setState({
           inventories: inv.filter(inventory => Object.values(inventory.owners).includes(USER_ID)),
         })
     );

  /*  rebase.fetch(`inventories`, {
      context: this,
      withIds: true,
      asArray: true
    }).then((inv) => {
      rebase.fetch(`inventoryAccess`, {
        context: this,
        withIds: true,
        asArray: true
      }).then((invAcc) => {
        let accessible = invAcc.filter(inventoryAcc => inventoryAcc.userID === USER_ID).map(invAcc => invAcc.invID);
        let availableInv = inv.filter(inventory => accessible.includes(inventory.key));
        this.setState({
          inventories: availableInv,
        })
      });
    });*/
  }

  componentDidMount() {
      rebase.bindToState(`inventories`, {
       context: this,
       state: 'inventories',
       asArray: true,
     });
  }

  removeInv(id){
    let newOwners = {...this.state.owners};
/*    if (Object.keys(newOwners).length === 1){
      rebase.remove(`recipes/${this.state.key}`)
      .then((x) =>
        {
          this.setState({
              message: "Recipe deleted from your recipe book!",
              showMessage: true,
          })
          this.props.navigation.navigate("Recipes");
        }
      );
    } else {*/
        for(var f in newOwners) {
           if(newOwners[f] == store.getState().user.uid) {
               delete newOwners[f];
           }
       }
          rebase.update(`inventories/${this.state.key}`, {
            data: {owners: newOwners}
          }).then((x) =>
          {
            this.setState({
                message: "Inventory deleted!",
                showMessage: true,
            })
          }
        );
    //  }
  }

  render() {
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
            {/*
              this.state.showStuff &&
            <Right>
              <Button  transparent noBorder  onPress={() => {this.setState({showTrash: !this.state.showTrash}); console.log("meh")}}>
              <Icon active name='md-settings' style={styles.sidebarIcon}  />
              </Button>
            </Right>
            */}
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
                    <ListItem  style={{...styles.sidebarInvItem}} noBorder  onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Inventory', {title: data.name, id: data.key, notes: data.notes}); }}>
                      <Left>
                        <Thumbnail
                          style={styles.stretch}
                          source={require('../helperFiles/sushi.jpg')}
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
              <Text style={{...styles.text}}>Správy</Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>

          <ListItem button noBorder style={{...styles.sidebarSettings}} onPress={()=>{ this.props.closeDrawer(); this.props.navigation.navigate('Settings');}} >
            <Left>
              <Icon active name='md-settings' style={{...styles.sidebarIcon}} />
              <Text style={{...styles.text}}>Nastavenia</Text>
            </Left>
            <Right style={{ flex: 1 }}>
            </Right>
          </ListItem>

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
