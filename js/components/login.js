import React, { Component } from 'react';
import { Container, Header, Title, Content, Thumbnail, Button, Icon, Left, Picker, Right, Body, Text, List, ListItem, CheckBox, Grid, Col, Badge, Form, Label, Input, Item } from 'native-base';
import firebase from 'firebase';


const ACC_VIO = 'rgb(124, 90, 150)';
const ACC_CREAM = 'rgb(252, 244, 217)';
const ACC_PEACH = 'rgb(255, 184, 95)';
const ACC_DARK_PEACH = 'rgb(255, 122, 90)';
const ACC_TEAL = 'rgb(142, 210, 210)';
const ACC_DARK_TEAL = 'rgb(0, 170, 160)';

export default class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email:'',
      password:'',
      token:null
    };

    this.register.bind(this);
    this.login.bind(this);
  }

  login(){
      firebase.auth().signInWithEmailAndPassword(this.state.email,this.state.password).then((res)=>{
        this.setState({token:res});
        console.log("REGISTERED");
        console.log(res);
      }).catch(error=>{console.log(error)});
    }

    register(){
      firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
    }

  render() {
    return (
      <Container style={{backgroundColor:'white'}}>
        <Content>
          <Input
            placeholder="E-mail"
            type="email"
            onChangeText={(text) => this.setState({email: text})}/>
          <Input
            placeholder="Password"
            type="password"
            onChangeText={(text) => this.setState({password: text})}/>
          <Button onPress={this.login.bind(this)} >
            <Text>
            Login
          </Text>
          </Button>
          <Button onPress={this.register.bind(this)} >
            <Text>
            Register
          </Text>
          </Button>
        </Content>
        </Container>
    );
  }
}
