import React, {Component} from 'react';
import {Image, Platform} from 'react-native';
import { Drawer,  Content, Grid, Row, Col, Card, Header, Body, Title, Label, Form, Item, Input, Text, Textarea, List, ListItem, Icon, Container, Picker,Thumbnail, Left, Right, Button, Badge, View, StyleProvider, getTheme, variables } from 'native-base';
import Sidebar from './sidebar';

import { rebase } from '../../index';
import firebase from 'firebase';
import { LoginButton, AccessToken, LoginManager  } from 'react-native-fbsdk';

import store from "../store/index";

import styles from '../style';

export default class DetailInventory extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: this.props.navigation.getParam('title', 'NO-ID'),
      notes: this.props.navigation.getParam('notes', 'NO-ID'),
      key: this.props.navigation.getParam('id', 'NO-ID'),

      editTitle: false,
      editNotes: false,

      showID: false,

      searchOpen: false,
      searchedWord: '',
      addOpen: false,

      ingredients: {},
      foodInInventory: {},
    };

    this.toggleAdd.bind(this);
    this.toggleSearch.bind(this);
    this.addItem.bind(this);
    this.submitInv.bind(this);
  }

  componentDidMount(){
      this.ref1 = rebase.syncState(`foodInInventory/${this.state.key}`, {
          context: this,
          state: 'foodInInventory',
          withIds: true,
        });
      this.ref2 = rebase.syncState(`ingredients`, {
          context: this,
          state: 'ingredients',
          withIds: true,
          asArray: true,
        });
    }

    componentWillReceiveProps(){
      rebase.removeBinding(this.ref1);
      this.ref1 = rebase.syncState(`foodInInventory/${this.props.navigation.getParam('id', 'NO-ID')}`, {
          context: this,
          state: 'foodInInventory',
          withIds: true,
        });
      this.setState({
        name: this.props.navigation.getParam('title', 'NO-ID'),
        notes: this.props.navigation.getParam('notes', 'NO-ID'),
        key: this.props.navigation.getParam('id', 'NO-ID'),

        editTitle: false,
        editNotes: false,

        showID: false,

        searchOpen: false,
        searchedWord: '',
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

    submitInv(){
      rebase.update(`inventories/${this.state.key}`, {
        data: {name: this.state.name, notes: this.state.notes}
      }).then((data) =>
        this.setState({editNotes: false, editTitle: false})
      );
    }

    toggleAdd(){
      this.setState({
        addOpen: !this.state.addOpen,
      });
    }

  closeDrawer = () => {
    this.drawer._root.close()
  };
  openDrawer = () => {
    this.drawer._root.open()
  };

  render() {
    let FOOD = [];

     if (this.state.ingredients.length > 0){
       FOOD = this.state.ingredients.filter(ing => Object.keys(this.state.foodInInventory).includes(ing.key)).map(ing => ({key: ing.key, name: ing.name, amount: this.state.foodInInventory[ing.key]}));
     }


    return (
      <Drawer
        ref={(ref) => { this.drawer = ref; }}
        content={<Sidebar navigation={this.props.navigation} closeDrawer={() => this.closeDrawer()}/>}
        onClose={() => this.closeDrawer()} >
        <Container>
           <Header style={{ ...styles.header}}>
             <Left>
               <Button transparent onPress={() => this.openDrawer()}>
                 <Icon name="menu" style={{ ...styles.headerItem}} />
               </Button>
             </Left>
             <Body>
               { (!this.state.searchOpen && !this.state.editTitle)
                 &&
                 <Title style={{ ...styles.headerItem}}>{this.state.showID ? this.state.key : this.state.name}</Title>
               }
               {(this.state.searchOpen)
                 &&
                   <View>
                     <Input
                       autoFocus
                       style={{ ...styles.headerItem}}
                       placeholder="search"
                       placeholderTextColor='rgb(0, 170, 160)'
                       onChangeText={(text) => this.setState({searchedWord: text})}/>
                   </View>
               }
               {(this.state.editTitle)
                 &&
                 <Item floatingLabel>
                   <Label style={{ ...styles.headerItem}}>Change name</Label>
                 <Input
                   autoFocus
                   style={{ ...styles.headerItem}}
                   placeholder="change name"
                   value={this.state.name}
                   onChangeText={(text) => this.setState({name: text})}/>
               </Item>
               }
             </Body>
             <Right>
               <Button transparent onPress={() => this.setState({searchOpen: (!this.state.editTitle && !this.state.showID ? !this.state.searchOpen : false)})}>
                 <Icon name="search" style={{ ...styles.headerItem}}/>
               </Button>
               {!this.state.editTitle
                 &&
               <Button transparent onPress={() => this.setState({editTitle: (!this.state.searchOpen && !this.state.showID ? !this.state.editTitle : false)})}>
                 <Icon name="md-create" style={{ ...styles.headerItem}}/>
               </Button>
               }
               {this.state.editTitle
                 &&
               <Button transparent onPress={() => this.submitInv()}>
                 <Icon name="md-checkmark" style={{ ...styles.headerItem}}/>
               </Button>
               }
               <Button transparent onPress={() => this.setState({showID: (!this.state.editTitle && !this.state.searchOpen ? !this.state.showID : false) })}>
                 <Icon name="md-share-alt" style={{ ...styles.headerItem}} />
               </Button>
             </Right>

           </Header>

           <Content padder style={{ ...styles.content}}>
             <Item style={{ ...styles.formTitle }}>
               { !this.state.editNotes
                 &&
               <Text style={{ ...styles.formInvNotes }}>{this.state.notes}</Text>
               }
               { this.state.editNotes
                 &&
                 <Textarea
                   rowSpan={6}
                   style={{ ...styles.genericInputStretched }}
                   autoFocus
                   bordered
                   placeholder="Notes"
                   value={this.state.notes}
                   onChangeText={(text) => this.setState({notes: text})} />
                 }
                 <Right>
                 {
                   !this.state.editNotes
                   &&
                   <Icon name="md-create" style={{ ...styles.formInvNotes, fontSize: 20}} onPress={() => this.setState({editNotes: true})}/>
                 }
                 {    this.state.editNotes
                   &&
                     <Icon name="md-checkmark" style={{ ...styles.formInvNotes, fontSize: 20}} onPress={() => this.submitInv()}/>
                 }
               </Right>
               </Item>



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
                        <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddIngredientBarcode')} >
                          <Text style={{ ...styles.acordionButtonText }}>Use barcode</Text>
                        </Button>
                     </Col>
                     <Col size={50}>
                        <Button transparent full style={{ ...styles.acordionButton}} onPress={()=> this.props.navigation.navigate('AddIngredientManual')} >
                          <Text style={{ ...styles.acordionButtonText }}>Create new</Text>
                        </Button>
                     </Col>
                  </Row>
                  </Grid>

                }

             <Card transparent style={{ ...styles.listCard}}>
               <List
                 dataArray={FOOD.filter(ing => ing.name.toLowerCase().includes(this.state.searchedWord.toLowerCase()))} renderRow={data =>
                   <ListItem noBorder>
                     <Left><Text style={{ ...styles.detailRecipeRowText }}>{data.name}</Text></Left>
                     <Right><Text style={{ ...styles.detailRecipeRowTextAmount }}>{data.amount}</Text></Right>
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
