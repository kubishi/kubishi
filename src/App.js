import qs from 'query-string';
import React from 'react';
import {
  Button,
  Col, Container, Nav, Navbar,
  NavDropdown, Row, Spinner
} from 'react-bootstrap';
import cookie from 'react-cookies';
import FacebookLogin from 'react-facebook-login';
import HttpsRedirect from 'react-https-redirect';
import { Redirect, Route, Router, Switch, useParams } from 'react-router-dom';
import { SocialIcon } from 'react-social-icons';
import About from './About';
import api from './Api';
import './App.css';
import ArticleEdit from './ArticleEdit';
import ArticleNew from './ArticleNew';
import ArticleWindow from './ArticleWindow';
import history from './history';
import PrivacyPolicy from './PrivacyPolicy';
import Pronunciation from './Pronunciation';
import SearchBar from './SearchBar';
import SearchWindow from './SearchWindow';
import SentenceEdit from './SentenceEdit';
import SentenceNew from './SentenceNew';
import SentenceWindow from './SentenceWindow';
import UserType from './UserType';
import WordEdit from './WordEdit';
import WordNew from './WordNew';
import WordWindow from './WordWindow';


const { REACT_APP_FACEBOOK_APP_ID } = process.env;

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

      redirect: null,
    }
  }

  componentDidMount() {
    this.getUser();
  }

  handleLogout(e) {
    e.preventDefault();
    if (window.FB) {
      window.FB.logout();
    }
    cookie.remove('user_id',  { path: '/' });
    cookie.remove('signed_request',  { path: '/' });
    this.setState({user: false});
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
      return this.setState({user: false});
    };

    if (user != null && user.ids.includes(user_id)) {
      return this.setState({user: user});
    }

    api.get(`/api/users/${user_id}`).then(res => {
      if (res.status == 200) {
        return this.setState({user: res.data.result});
      } else {
        console.log(res.status, res.data);
        return this.setState({user: false});
      }
    }).catch(err => {
      console.error(err);
      return this.setState({user: false});
    });
  }

  createUser(user_id, user_name, user_email, signed_request) {
    api.post('/api/users', 
      {
        'id': user_id,
        'name': user_name,
        'email': user_email,
        'created': new Date(),
        'type': 'USER',
      },
      {headers: {signed_request: signed_request}}
    ).then(user => {
      this.setUser(user.data.result, signed_request);
    }).catch(err => console.error(err));
  }

  handleLogin(response) {
    if (response) {
      let signed_request = response.signedRequest;

      api.get('/api/users/' + response.id, 
        {headers: {signed_request: signed_request}}
      ).then(res => {
        if (res.status == 200) {
          return this.setUser(res.data.result, signed_request);
        } else if (res.status == 404) {
          return this.createUser(response.id, response.name, response.email, signed_request);
        }
      }).catch(err => {
        if (err.response != null && err.response.status == 404) {
          return this.createUser(response.id, response.name, response.email, signed_request);
        } else {
          return console.error('err', err);
        }
      });
    }
  }
  
  getRandom(path, filterSentences = false) {
    let params = {fields: ['_id']};
    if (filterSentences && path == 'sentences') {
      params.match = JSON.stringify({paiuteTokens: {$exists: true}});
    }

    api.get(`/api/random/${path}`, {params: params}).then(res => {
        if (res.status == 200) {
            return history.replace(`/${path}/${res.data.result._id}`);
        } else {
            console.log(res.status, res.data);
        }
    }).catch(err => console.error(err));

    return <Spinner />;
}

  render() {    
    let loginButton = null;
    let { user } = this.state;
    if (user == null) return <Spinner />; // page is loading

    let canEdit = (UserType[user.type] || UserType.USER) >= UserType.EDITOR;

    if (user == false) {
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

    let contributeButton;
    if (canEdit) {
      contributeButton = (
        <NavDropdown title="Contribute" id="nav-dropdown">
          <NavDropdown.Item href='/create/article'>New Article</NavDropdown.Item>
          <NavDropdown.Item href='/create/word'>New Word</NavDropdown.Item>
          <NavDropdown.Item href='/create/sentence'>New Sentence</NavDropdown.Item>
        </NavDropdown>
      );
    }

    let navbar = (
      <Navbar bg="light" expand="md">
        <Navbar.Brand href="/">Kubishi</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Item>
              <Nav.Link href='/about'>About</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link href='/pronunciation'>Pronunciation Guide</Nav.Link>
            </Nav.Item>
            {contributeButton}
          </Nav>
          {loginButton}
        </Navbar.Collapse>
      </Navbar>
    );

    let socialSize = 35;
    let socialIcons = [
      <SocialIcon url="https://facebook.com/kubishi" className="m-1" style={{ height: socialSize, width: socialSize }} />,
      <SocialIcon url="https://instagram.com/ovkubishi" className="m-1" style={{ height: socialSize, width: socialSize }} />,
      <SocialIcon url="https://twitter.com/ovkubishi" className="m-1" style={{ height: socialSize, width: socialSize }} />,
    ];

    return (
      <HttpsRedirect>
        <Router history={history}>
          {navbar}
          <Container style={{paddingBottom: '75px'}}>
            <Switch>
              <Route path="/random/word" component={props => this.getRandom('words')} />
              <Route path="/random/sentence" component={props => this.getRandom('sentences', !canEdit)} />
              <Route path="/random/article" component={props => this.getRandom('articles')} />
              <Route path="/words/:id" component={(props) => {
                let { id } = useParams();
                let { mode } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                if (mode == "edit") {
                  if (canEdit) {
                    return <WordEdit wordId={id} getUser={() => this.state.user} />
                  } else {
                    return history.push(`/article/${id}`);
                  }
                }
                return <WordWindow wordId={id} canEdit={canEdit}/>;
              }} />
              <Route path="/articles/:id" component={(props) => {
                let { id } = useParams();
                let { mode } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                if (mode == "edit") {
                  if (canEdit) {
                    return <ArticleEdit articleId={id} user={this.state.user} />
                  } else {
                    return history.push(`/article/${id}`);
                  }
                }
                return <ArticleWindow canEdit={canEdit} articleId={id} getUser={() => this.state.user} />;
              }} />
              <Route path="/sentences/:id" component={(props) => {
                let { id } = useParams();
                let { mode } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                if (mode == "edit") {
                  if (canEdit) {
                    return <SentenceEdit sentenceId={id} />
                  } else {
                    return history.push(`/sentences/${id}`);
                  }
                }
                return <SentenceWindow canEdit={canEdit} sentenceId={id} getUser={() => this.state.user} />;
              }} />
              <Route path="/create/word" component={(props) => {
                return canEdit ? <WordNew /> : <Redirect path='/' />;
              }} />
              <Route path="/create/article" component={(props) => {
                return canEdit ? <ArticleNew user={this.state.user} /> : <Redirect path='/' />;
              }} />
              <Route path="/create/sentence" component={(props) => {
                return canEdit ? <SentenceNew /> : <Redirect path='/' />;
              }} />
              <Route path="/privacy">
                <PrivacyPolicy />
              </Route>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/pronunciation">
                <Pronunciation />
              </Route>
              <Route path="/search" 
                component={(props) => {
                  let { query } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                  return <SearchWindow query={query} timestamp={Date.now()} filterSentences={!canEdit} />;
                }} 
              />
              <Route path="/">
                <Row style={{marginTop: "20vh"}}>
                  <Col>
                    <SearchBar showRandomButtons autoFocus />
                  </Col>
                </Row>
              </Route>
            </Switch>
            <Navbar fixed="bottom" style={{opacity: "1", backgroundColor: "white"}} >
              <Nav>
                <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
              </Nav>
              <Nav className='mr-auto'>
                <Nav.Link href="mailto:help@kubishi.com">Contact</Nav.Link>
              </Nav>
              <Nav>
                {socialIcons}
              </Nav>
            </Navbar>
          </Container>
        </Router>
      </HttpsRedirect>
    );
  }
}

export default App;
