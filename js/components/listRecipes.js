import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer,  Card, Content, Header, Body, Title, Text, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index.android';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import store from "../store/index";

import styles from '../style';

export default class ListRecipes extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedInventory: "",

      searchOpen: false,
      searchedWord: '',

      recipes: [],
      inventories: [],
    };

    this.toggleSearch.bind(this);
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

    closeDrawer = () => {
      this.drawer._root.close()
    };
    openDrawer = () => {
      this.drawer._root.open()
    };


  render() {
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
             <Body>
               { this.state.searchOpen
               &&
               <Item>
                 <Input
                   style={{ ...styles.headerItem }}
                   placeholder="search"
                   onChangeText={(text) => this.setState({searchedWord: text})}/>
               </Item>
               }

               {!this.state.searchOpen
                 &&
                 <Title style={{ ...styles.headerItem }}> Sonkine Recepty</Title>
               }

             </Body>
             <Right>
               <Button transparent onPress={this.toggleSearch.bind(this)} >
                 <Icon name="search" style={{ ...styles.headerItem }} />
               </Button>
               <Button transparent  onPress={()=> this.props.navigation.navigate('AddRecipe')} >
                 <Icon name="md-add" style={{ ...styles.headerItem }}/>
               </Button>
             </Right>

           </Header>

         <Content padder style={{ ...styles.content }} >
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

            <Card transparent style={{ ...styles.listCard }}>
               <List
                 dataArray={this.state.recipes.filter(rec => rec.name.toLowerCase().includes(this.state.searchedWord.toLowerCase()))}
                 renderRow={data =>
                   <ListItem button style={{...styles.listItem}} noBorder onPress={() => this.props.navigation.navigate('Recipe', {rec: data, userID: store.getState().user.uid}) }>
                     <Left>
                       <Thumbnail
                         style={{ ...styles.stretch }}
                         source={require('../helperFiles/sushi.jpg')}
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
