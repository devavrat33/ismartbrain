import React, {Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';
import Particles from 'react-particles-js';




 



const particleOptions = {
    particles: {
      number: {
        value:30,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
} 
const initialState = {
  input: '',
  imageURL: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id:'',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
};

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
  }

  loadUser = (data)=>{
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }



calculateFaceLocation = (data) => {
  console.log('data:',data);
  const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
  const image = document.getElementById('inputimage');
  const width = Number(image.width);
  const height = Number(image.height);
  return {
    leftCol: clarifaiFace.left_col * width,
    topRow : clarifaiFace.top_row * height,
    rightCol: width - (clarifaiFace.right_col * width),
    bottomRow: height - (clarifaiFace.bottom_row * height)
    }
}


// calculateFaceLocation = (data) => {
//   console.log('data:',data);
//   const clarifaiFace = data.outputs[0].data.regions.map(region=> region.region_info.bounding_box);
//   const image = document.getElementById('inputimage');
//   const width = Number(image.width);
//   const height = Number(image.height);
//   return clarifaiFace.map(bounding_box => {

//     return 
//     {
//       leftCol: bounding_box.left_col * width,
//       topRow : bounding_box.top_row * height,
//       rightCol: width - (bounding_box.right_col * width),
//       bottomRow: height - (bounding_box.bottom_row * height)
//       }
//   })
  
// }


displayFaceBox = (box) => {
  console.log('box:',box);
  this.setState({box: box});
}

onInputChange= (event)=>{
  this.setState({input: event.target.value} );
}

onButtonSubmit = () => {
  this.setState({imageURL: this.state.input});
  fetch('https://calm-atoll-31346.herokuapp.com/imageurl', {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      input: this.state.input
  })
})
  .then(response => response.json())
  .then((response)=>{
    if (response){  
      fetch('https://calm-atoll-31346.herokuapp.com/image', {
        method: 'put',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: this.state.user.id
      })
      }).then(response => response.json())
    .then(count=> { 
      this.setState(Object.assign(this.state.user, {entries:count}))
    } )
    .catch(console.log)
  }
    this.displayFaceBox(this.calculateFaceLocation(response))
  })
  .catch(err => console.log(err));
}

onRouteChange = (route) => {
  if (route==='signout'){
    this.setState(initialState);
    }else if(route==='home'){
      this.setState({isSignedIn: true});
    }
  this.setState({route: route});
}


  render(){
    const {isSignedIn, imageURL, route, box} = this.state;
    return (
      <div className="App">
      <Particles className='particles'
          params={particleOptions}
      />

         <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
         {route === 'home'
         ?<div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/> 
            <ImageLinkForm onInputChange = {this.onInputChange} 
            onButtonSubmit = {this.onButtonSubmit}/>
            <FaceRecognition box = {box} imageURL={imageURL} />
         </div>
         :(
           this.state.route==='signin'
           ?<Signin loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
           :<Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
         )
      
        }
       
      </div>  
    );

  }
  
}

export default App;
