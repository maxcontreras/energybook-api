/* @flow */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
  Dimensions,
  SafeAreaView,
  FlatList,
} from 'react-native';
import axios from 'axios';
import styles from './styles';
import logo from './logo.jpg';
import logo2 from './logo2.png';
const apiEndpoint = 'http://localhost:3000/api/eUsers/login?access_token=14BGn34LvakFIQ4nk1AzMIR6k6nda0uPHhHoXNbH4eZnxARFEzqJ1EtElvX8VG4f';



 class Home extends Component| {
   constructor(){
   super()
   this.state = {
     /*username: "",
     passsword: "",*/
     posts: []

   }
 }

 static navigationOptions = {
    header: null

 }

   checkLogin() {
     const {username, passsword} = this.state
     //console.warn(username, password)
     if(username == 'admin' && passsword == 'admin'){
       this.props.navigation.navigate('Dashboard')
     }else {
       Alert.alert('Error', 'Username/Password mismatch',[{
         text: 'Okay'
       }])
     }
   }


   componentWillMount() {

            fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                  firstParam: 'email',
                  secondParam: 'password',
            }),
            });

  /*.then((response) => console.log(response.json()))
    .then((responseJson) => {
    //return responseJson.movies;
    })
    .catch((error) => {
    console.error(error);
    });*/

   }


  render() {

    const {Inputt, TextLog, parent,container,btn,todo,bchido,tbienvenido,scroll,text,arriba,abajo, droidSafeArea} = styles
    var deviceHeight = Dimensions.get('window').height;
    var deviceWidth = Dimensions.get('window').width;


    return (

      <ScrollView style = {{flex: 1}}  keyboardShouldPersistTaps='never'>
      <SafeAreaView >
      <KeyboardAvoidingView enabled >
      <View style={{height: deviceHeight, width: deviceWidth}}>

          <ImageBackground source={logo2} style={{width: '100%', height: '100%'}}>

              <View style={todo}>
                    <View style={container}>
                          <View style = {arriba}>

                              <View style = {parent}>
                                  <Image style={{width: 250, height: 100}} source={logo} />
                              </View>

                              <View style={text}>
                                  <Text style= {{fontSize: 16, textAlign: 'center', fontWeight: 'bold'}}>MONITOREA, ANALIZA Y AHORRA {"\n"} ENERGIA</Text>
                              </View>
                              <View>
                                  <Text style= {tbienvenido}>¡Bienvenido! Ingresa a tu cuenta</Text>
                                  <TextInput style ={Inputt}
                                            placeholder="  Usuario"
                                            onChangeText={text => this.setState({username: text})}
                                            autoCapitalize= 'none'/>
                                  <TextInput style ={Inputt}
                                            placeholder="  Contraseña"
                                            secureTextEntry= {true}
                                            onChangeText={text => this.setState({passsword: text})}
                                            autoCapitalize= 'none'/>
                              </View>
                              <View style={parent}>
                                  <TouchableOpacity  onPress={() => this.checkLogin()} style = {btn}>
                                            <Text style={{ color: 'white', fontSize: 15}}>Iniciar Sesión</Text>
                                  </TouchableOpacity>
                              </View>



                              <View style = {abajo}>
                                      <Text style= {{color: '#A19C9C', paddingBottom: 20}}>No tienes cuenta?</Text>
                                      <TouchableOpacity  onPress={() => this.checkLogin()} style = {btn}>
                                                <Text style={{ color: 'white', fontSize: 15}}>Regístrate</Text>
                                      </TouchableOpacity>
                              </View>


                            </View>
                    </View>
              </View>

              </ImageBackground>

          </View>
          </KeyboardAvoidingView>
          </SafeAreaView>
          </ScrollView>



    );
  }
}


export default Home
