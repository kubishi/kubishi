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

import cookie from 'react-cookies';

import FacebookLogin from 'react-facebook-login';
import SearchWindow from './SearchWindow';
import WordWindow from './WordWindow';

import {
  BrowserRouter as Router,
  Switch, useParams,
  Route, Link
} from "react-router-dom";

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
      user: null,
    }
  }

  handleLogout(e) {
    e.preventDefault();
    if (window.FB) {
      window.FB.logout();
    }
    this.setState({user: null});
    cookie.remove('user_id',  { path: '/' });
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
        console.log('result', user.data.result);
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
          <FacebookLogin
            appId={FACEBOOK_APP_ID}
            fields="name,email,picture"
            callback={response => this.handleLogin(response)}
            cssClass="btn btn-default my-facebook-button-class"
          />
        );
      }
    } else {
      loginButton = (
        <Nav>
          <p className='pt-2'>
            {'Welcome, ' + user.name}
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
      <Navbar.Brand href="/">Yaduha</Navbar.Brand>
      <Navbar.Collapse id="basic-navbar-nav">
        <span className="mr-auto" />
        <Nav>
          <Nav.Item>
            {loginButton}
          </Nav.Item>
        </Nav>
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
