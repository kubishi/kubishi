import React from 'react';
import './App.css';
import axios from 'axios';
import { FACEBOOK_APP_ID, API_URL, API_KEY } from './env';
import { 
  Button, Container, Navbar, Nav, Modal, Form
} from 'react-bootstrap';

import cookie from 'react-cookies';

import FacebookLogin from 'react-facebook-login';
import SearchWindow from './SearchWindow';
import WordWindow from './WordWindow';
import UserType from './UserType';
import PartOfSpeech from './PartOfSpeech';

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
      headers: {api_key: API_KEY},
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
      {headers: {api_key: API_KEY}}
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
      <Navbar.Brand href="/">Yaduha</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
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
      <Router>
        <Container>
          {addWordModal}
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
