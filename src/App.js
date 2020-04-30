import React from 'react';
import './App.css';
import axios from 'axios';
import querystring from 'querystring';
import { FACEBOOK_APP_ID, API_URL, API_KEY } from './env';
import { 
  Button, Jumbotron, Container, 
  Row, Col, InputGroup, FormControl,
  ListGroup, Navbar, Nav
} from 'react-bootstrap';


import FacebookLogin from 'react-facebook-login';
import MainWindow from './MainWindow';

const api = axios.create({
  baseURL: API_URL,
})

class WordCard extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <h3>{this.props.word}</h3>
        <p><i>{String(this.props.pos).toLowerCase().replace("_", " ")}</i></p>
        <p>{this.props.def}</p>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "search_value": "",
      "words": [],
      "user": null,
    }
  }

  clearWords() {
    this.setState({"words": []});
  }

  addWord(word) {
    const words = this.state.words.slice();
    words.push(word);
    this.setState({"words": words});
  }

  handleSearch(event) {
    console.log("Searching for word!! " + this.state.search_value);
    api.get(
      "/search/words",  
      {"params": {"query": this.state.search_value}}
    ).then((res) => {
      this.clearWords();
      res.data.oids.forEach(oid => {
        api.get("words/" + oid).then((res) => {
          if (res.status == 200) this.addWord(res.data);
          else console.log("Error getting '" + oid + "': " + res.status);
        }).catch((err) => {
          console.log("Error getting '" + oid + "': " + err);
        })
      });
    }).catch((res) => {
      console.log("Error" + res);
    });
  }

  handleLogout(e) {
    e.preventDefault();
    window.FB.logout();
    this.setState({user: null});
  }

  handleLogin(response) {
    if (response) {
      api.get('/api/user/facebook_' + response.id, {
        headers: {api_key: API_KEY}
      }).then(user => {
        this.setState({user: user.data.result});
      }).catch(err => {
        if (err.response.status == 404) { // Create new user
          api.post('/api/user', {
            'id': 'facebook_' + response.id,
            'name': response.name,
            'email': response.email,
            'created': new Date(),
            'type': 'USER',
          }, {headers: {api_key: API_KEY}}).then(user => {
            this.setState({user: user.data.result});
          }).catch(err => {
            console.error(err.response);
          })
        }
      });
    }
  }

  render() {
    let logInOrOut, main;
    let { user } = this.state;
    if (user == null) {
      logInOrOut = (
        <FacebookLogin
          appId={FACEBOOK_APP_ID}
          autoLoad={true}
          fields="name,email,picture"
          callback={response => this.handleLogin(response)}
          cssClass="btn btn-default my-facebook-button-class"
        />
      );
    } else {
      logInOrOut = (
        <Nav>
          <p className='pt-2'>
            {'Welcome, ' + this.state.user.name}
          </p>
          <Button 
            className="ml-3"
            variant="outline-primary" 
            onClick={e => this.handleLogout(e)}
          >Logout</Button>
        </Nav>
      );
    }

    let navbar = (
      <Navbar bg="light" expand="lg">
      <Navbar.Brand href="#home">Yaduha</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <span className="mr-auto" />
        <Nav>
          <Nav.Item>
            {logInOrOut}
          </Nav.Item>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
    );

    return (
      <Container>
        {navbar}
        <MainWindow getUser={() => this.state.user} />
      </Container>
    );
  }
}

export default App;
