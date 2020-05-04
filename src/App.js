import React from 'react';
import './App.css';
import axios from 'axios';
import { 
  Button, Container, Navbar, Nav, Modal, Form
} from 'react-bootstrap';

import cookie from 'react-cookies';

import FacebookLogin from 'react-facebook-login';
import SearchWindow from './SearchWindow';
import WordWindow from './WordWindow';
import UserType from './UserType';
import PartOfSpeech from './PartOfSpeech';
import HttpsRedirect from 'react-https-redirect';

import PrivacyPolicy from './PrivacyPolicy';
import About from './About';

import {
  BrowserRouter as Router,
  Switch, useParams, Route,
} from "react-router-dom";

const { REACT_APP_FACEBOOK_APP_ID, REACT_APP_API_URL, REACT_APP_API_KEY } = process.env;

const api = axios.create({
  baseURL: REACT_APP_API_URL,
})

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      showAddWord: false,
      addWordPaiute: 'Paiute',
      addWordText: null,
      addWordPos: 'unknown',
      addWordDef: null,
    }
  }

  handleLogout(e) {
    e.preventDefault();
    if (window.FB) {
      window.FB.logout();
    }
    cookie.remove('user_id',  { path: '/' });
    cookie.remove('signed_request',  { path: '/' });
    this.setState({user: null});
  }

  setUser(user, signed_request) {
    cookie.save('signed_request', signed_request, { path: '/' });
    cookie.save('user_id', user.ids[0], { path: '/' });
    this.setState({user: user});
  }

  getUser() {
    let { user } = this.state;
    let signed_request = cookie.load('signed_request');
    let user_id = cookie.load('user_id');
    if (signed_request == null || user_id == null) {
      return null;
    };

    if (user != null && user.ids.includes(user_id)) return user;

    api.get('/api/user/' + user_id,
      {headers: {signed_request: signed_request}}
    ).then(res => {
      if (res.status == 200) {
        this.setState({user: res.data.result});
      } else {
        console.log(res.status, res.data);
      }
    }).catch(err => console.error(err));
  }

  handleLogin(response) {
    if (response) {
      let signed_request = response.signedRequest;

      api.get('/api/user' + response.id,
        {headers: {signed_request: signed_request}}
      ).then(user => {
        this.setUser(user.data.result, signed_request);
      }).catch(err => {
        if (err.response == null) {
          return console.error(err);
        }
        if (err.response.status == 404) { // Create new user
          api.post('/api/user', 
            {
              'id': response.id,
              'name': response.name,
              'email': response.email,
              'created': new Date(),
              'type': 'USER',
            },
            {headers: {signed_request: signed_request}}
          ).then(user => {
            this.setUser(user.data.result, signed_request);
          }).catch(err => {
            console.error(err.response);
          })
        }
      });
    }
  }

  randomWord(e) {
    api.get('/api/random/word', {
      headers: {signed_request: cookie.load('signed_request')},
      params: {
        is_paiute: true
      }
    }).then(res => {
      if (res.status == 200) {
        window.location.href = '/word/' + res.data.result._id;
      } else {
        console.log(res.status, res.data);
      }
    }).catch(err => console.error(err));
  }

  canEdit() {
    let { user } = this.state;
    if (user != null && UserType[user.type] != null && UserType[user.type] >= UserType.EDITOR) {
        return true;
    }
    return false;
  }

  getWordForm() {
    let { addWordText, addWordDef } = this.state;
    let posOptions = PartOfSpeech.map((part_of_speech, i) => {
        let pos = part_of_speech.toLowerCase().replace('_', ' ');
        return (
            <option key={'option-pos-' + i}>{pos}</option>
        );
    });
    return (
      <Form>
        
        <Form.Group controlId='formAddLanguage'>
              <Form.Label>Language</Form.Label>
              <Form.Control 
                  as="select" 
                  defaultValue='Paiute' 
                  onChange={e => {this.setState({addWordPaiute: e.target.value})}}
              >
                <option key='formAddPaiuteOption'>Paiute</option>
                <option key='formAddEnglishOption'>English</option>
              </Form.Control>
          </Form.Group>

          <Form.Group controlId='formAddWord'>
              <Form.Label>Word</Form.Label>
              <Form.Control 
                  type='text'
                  isValid={addWordText != null && addWordText != ''}
                  onChange={e => {this.setState({addWordText: e.target.value})}}
              />
          </Form.Group>

          <Form.Group controlId='formAddPOS'>
              <Form.Label>Part of Speech</Form.Label>
              <Form.Control 
                  as="select" 
                  defaultValue='unknown'
                  isValid={addWordText != null && addWordText != ''}
                  onChange={e => {this.setState({addWordPos: e.target.value})}}
              >
                  {posOptions}
              </Form.Control>
          </Form.Group>

          <Form.Group controlId='formAddDefinition'>
              <Form.Label>Definition</Form.Label>
              <Form.Control 
                as="textarea"
                isValid={addWordDef != null && addWordDef != ''}
                onChange={e => this.setState({addWordDef: e.target.value})}
              />
          </Form.Group>
      </Form>
    );
  }

  addWord() {
    if (!this.canEdit()) {
      console.error("User cannot add words");
      return;
    }

    let { addWordText, addWordDef, addWordPos, addWordPaiute } = this.state;

    let fields = [addWordText, addWordDef, addWordPos, addWordPaiute];
    if (fields.some(e => e == null)) {
      console.error('Some of the fields are null: ', fields);
      return;
    }

    api.post('/api/word', 
      {
        text: addWordText,
        is_paiute: addWordPaiute == 'Paiute',
        definition: addWordDef,
        part_of_speech: addWordPos.toUpperCase().replace(' ', '_'),
      },
      {headers: {signed_request: cookie.load('signed_request')}}
    ).then(res => {
      if (res.status == 200) {
        window.location.href = '/word/' + res.data.result._id;
      } else {
        console.log(res.status, res.data);
      }
    }).catch(err => console.error(err));
  }

  getAddWordModal() {
    let { showAddWord } = this.state;
    return (
      <Modal 
        show={showAddWord} 
        onHide={() => this.setState({showAddWord: false})}
      >
        <Modal.Header>
          Add Word
        </Modal.Header>
        <Modal.Body>
          {this.getWordForm()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='outline-primary'
            onClick={e => this.setState({showAddWord: false})}
          >
            Cancel
          </Button>
          <Button
            variant='outline-success'
            onClick={e => this.addWord()}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  containerWrap(body) {

  }

  render() {    
    let loginButton = null;
    let user = this.getUser();
    if (user == null) {
      loginButton = ( 
        <Nav>
          <Nav.Item>
            <FacebookLogin
              appId={REACT_APP_FACEBOOK_APP_ID}
              fields="name,email,picture"
              disableMobileRedirect={true}
              callback={response => this.handleLogin(response)}
              cssClass="btn btn-default my-facebook-button-class"
            />
          </Nav.Item>
        </Nav>
      );
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

    let addWordButton;
    if (this.canEdit()) {
      addWordButton = (
        <Nav.Item onClick={e => this.setState({showAddWord: true})}>
          <Nav.Link>
            New Word
          </Nav.Link>
        </Nav.Item>
      );
    }

    let navbar = (
      <Navbar bg="light" expand="lg">
      <Navbar.Brand href="/">Kubishi</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Item>
            <Nav.Link href='/'>Search</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link href='/about'>About</Nav.Link>
          </Nav.Item>
          <Nav.Item onClick={e => this.randomWord(e)}>
            <Nav.Link>
              Random Word!
            </Nav.Link>
          </Nav.Item>
          {addWordButton}
        </Nav>
        {loginButton}
      </Navbar.Collapse>
    </Navbar>
    );
    
    let addWordModal;
    if (this.canEdit()) {
      addWordModal = this.getAddWordModal();
    }

    return (
      <HttpsRedirect>
        <Router>
          <Container style={{paddingBottom: '65px'}}>
            {addWordModal}
            <Switch>
              <Route path="/word/:id">
                {navbar}
                <WordWindowRoute getUser={() => this.state.user} />
              </Route>
              <Route path="/privacy">
                <PrivacyPolicy />
              </Route>
              <Route path="/about">
                {navbar}
                <About />
              </Route>
              <Route path="/">
                {navbar}
                <SearchWindow getUser={() => this.state.user} />
              </Route>
            </Switch>
            <Navbar fixed="bottom" style={{opacity: "1", backgroundColor: "white"}} >
              <Nav>
                <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
              </Nav>
            </Navbar>
          </Container>
        </Router>
      </HttpsRedirect>
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
