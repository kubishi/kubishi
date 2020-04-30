import React from 'react';
import './App.css';
import axios from 'axios';
import { FACEBOOK_APP_ID, API_URL, API_KEY } from './env';
import { 
  Button, Container, Navbar, Nav
} from 'react-bootstrap';

import cookie from 'react-cookies';

import FacebookLogin from 'react-facebook-login';
import SearchWindow from './SearchWindow';
import WordWindow from './WordWindow';

import {
  BrowserRouter as Router,
  Switch, useParams, Route,
} from "react-router-dom";

const api = axios.create({
  baseURL: API_URL,
})

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null
    }
  }

  handleLogout(e) {
    e.preventDefault();
    if (window.FB) {
      window.FB.logout();
    }
    cookie.remove('user_id',  { path: '/' });
    this.setState({user: null});
  }

  setUser(user) {
    this.setState({user: user});
    cookie.save('user_id', user.ids[0], { path: '/' });
  }

  handleLogin(response) {
    if (response) {
      api.get('/api/user/facebook_' + response.id, {
        headers: {api_key: API_KEY}
      }).then(user => {
        this.setUser(user.data.result);
      }).catch(err => {
        console.error(err);
        if (err.response.status == 404) { // Create new user
          api.post('/api/user', {
            'id': 'facebook_' + response.id,
            'name': response.name,
            'email': response.email,
            'created': new Date(),
            'type': 'USER',
          }, {headers: {api_key: API_KEY}}).then(user => {
            this.setUser(user.data.result);
          }).catch(err => {
            console.error(err.response);
          })
        }
      });
    }
  }

  randomWord(e) {
    api.get('/api/random/word', {
      headers: {api_key: API_KEY}
    }).then(res => {
      if (res.status == 200) {
        window.location.href = '/word/' + res.data.result._id;
      } else {
        console.log(res.status, res.data);
      }
    }).catch(err => console.error(err));
  }

  render() {    
    let loginButton = null;
    let { user } = this.state;
    if (user == null) {
      let user_id = cookie.load('user_id');
      if (user_id) {
        api.get('/api/user/' + user_id, {
          headers: {api_key: API_KEY}
        }).then(user => {
          this.setUser(user.data.result);
        }).catch(err => {
          console.error(err);
        });
      } else {
        loginButton = ( 
          <Nav>
            <Nav.Item>
              <FacebookLogin
                appId={FACEBOOK_APP_ID}
                fields="name,email,picture"
                callback={response => this.handleLogin(response)}
                cssClass="btn btn-default my-facebook-button-class"
              />
            </Nav.Item>
          </Nav>
        );
      }
    } else {
      loginButton = (
        <Nav>
          <Nav.Item>
            <Nav.Link disabled>
              {'Welcome, ' + user.name}
            </Nav.Link>
          </Nav.Item>
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
      <Navbar.Brand href="/">Yaduha</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Item onClick={e => this.randomWord(e)}>
            <Nav.Link>
              Random Word!
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <span className="mr-auto" />
        {loginButton}
      </Navbar.Collapse>
    </Navbar>
    );
    
    return (
      <Router>
        <Container>
          {navbar}
          <Switch>
            <Route path="/word/:id">
              <WordWindowRoute getUser={() => this.state.user} />
            </Route>
            <Route path="/">
              <SearchWindow getUser={() => this.state.user} />
            </Route>
          </Switch>
        </Container>
      </Router>
    );
  }
}

function WordWindowRoute(props) {
  let { id } = useParams();
  return (
    <WordWindow wordId={id} getUser={props.getUser} />
  );
}

export default App;
