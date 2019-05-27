import {StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native'

export default StyleSheet.create({
  Inputt: {
    borderRadius: 10,
    marginBottom:5,
    height: 40,
    backgroundColor: '#EFEFEF',
  },

  btn: {
      height: 40,
      borderRadius: 10, //circular thing
      justifyContent: 'center',
      alignItems: 'center',
      width:150,
      backgroundColor: '#313544',
      elevation: 10,
      ...Platform.select({
      ios: {
        shadowRadius: 10,
        shadowColor: 'black',
        shadowOffset: {width: 20,height: 20},
        shadowOpacity: .2,
      },

  }),
  },


  TextLog: {
      fontSize: 24,
      textAlign: 'center'
  },

  parent: { //el de abajo
      flex: 1,
      paddingBottom: 30,
      alignItems: 'center',
      backgroundColor: '#ffffff',
      paddingTop: 20,
      borderRadius: 10,
  },

  container: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      borderRadius: 10,
      elevation: 15,
      ...Platform.select({
      ios: {
        shadowRadius: 10,
        shadowColor: 'black',
        shadowOffset: {width: 20,height: 20},
        shadowOpacity: .2,


      },

  }),

  },

  todo: {
      flex: 1,
      borderRadius: 20,
      flexDirection: 'column',
      padding: 30,
      justifyContent: 'center',
      paddingBottom: 150,
  },

  tbienvenido: {
      fontSize: 15,
      color: '#000000',
      justifyContent: 'center',
      textAlign: 'center',
      paddingTop: 10 ,
      paddingBottom: 20
  },

  text: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 50,
  },
  arriba: {

    flex: 1,
    paddingBottom: 30,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
  },

  abajo: {
    flex: 1,
    paddingBottom: 30,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingTop: 20,
    borderTopColor: '#BAB1B1',
    borderTopWidth: 1
  }


})
