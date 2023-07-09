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
import About from './info/About';
import api from './Api';
import './App.css';
import ArticleEdit from './article/ArticleEdit';
import ArticleNew from './article/ArticleNew';
import ArticleWindow from './article/ArticleWindow';
import history from './common/history';
import PrivacyPolicy from './info/PrivacyPolicy';
import Help from './info/Help';
import Pronunciation from './info/Pronunciation';
import SearchBar from './search/SearchBar';
import SearchWindow from './search/SearchWindow';
import SentenceEdit from './sentence/SentenceEdit';
import SentenceNew from './sentence/SentenceNew';
import SentenceWindow from './sentence/SentenceWindow';
import UserType from './user/UserType';
import WordEdit from './word/WordEdit';
import WordNew from './word/WordNew';
import WordWindow from './word/WordWindow';
import UserWindow from './user/UserWindow';
import WordList from './wordlist/WordList';
import WordListAll from './wordlist/WordListAll';
import WordListNew from './wordlist/WordListNew';
import WordListEdit from './wordlist/WordListEdit';
import WordListCrossword from './wordlist/WordListCrossword';


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

  handleLogout() {
    if (window.FB) {
      window.FB.logout();
    }
    cookie.remove('user_id',  { path: '/' });
    cookie.remove('signed_request',  { path: '/' });
    cookie.remove('can_edit', { path: '/' });
    this.setState({user: false});
  }

  setUser(user, signed_request) {
    cookie.save('signed_request', signed_request, { path: '/' });
    cookie.save('user_id', user.ids[0], { path: '/' });
    cookie.save('can_edit', (UserType[user.type] || UserType.USER) >= UserType.EDITOR, { path: '/' });
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

  render() {    
    let loginButton = null;
    let { user } = this.state;
    if (user == null) return <Spinner />; // page is loading

    let canEdit = cookie.load('can_edit');

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
            <Nav.Link href="/profile">
              {'Welcome, ' + user.name}
            </Nav.Link>
          </Nav.Item>
          <Button 
            className="ml-3"
            variant="outline-primary" 
            onClick={e => {
              e.preventDefault();
              this.handleLogout();
            }}
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

    let myListsButton;
    if (this.state.user) {
      myListsButton = (
        <Nav.Item key='nav-wordlist'>
          <Nav.Link href='/wordlist'>My Lists</Nav.Link>
        </Nav.Item>
      );
    }

    let navbar = (
      <Navbar bg="light" expand="md">
        <Navbar.Brand key='nav-brand' href="/">Kubishi</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Item key='nav-about'>
              <Nav.Link href='/about'>About</Nav.Link>
            </Nav.Item>
            <Nav.Item key='nav-pronunciation'>
              <Nav.Link href='/pronunciation'>Pronunciation Guide</Nav.Link>
            </Nav.Item>
            {myListsButton}
            {contributeButton}
          </Nav>
          {loginButton}
        </Navbar.Collapse>
      </Navbar>
    );

    let socialSize = 35;
    let socialIcons = [
      <SocialIcon key='social-facebook' url="https://facebook.com/kubishi" className="m-1" style={{ height: socialSize, width: socialSize }} />,
      <SocialIcon key='social-instagram' url="https://instagram.com/ovkubishi" className="m-1" style={{ height: socialSize, width: socialSize }} />,
      <SocialIcon key='social-twitter' url="https://twitter.com/ovkubishi" className="m-1" style={{ height: socialSize, width: socialSize }} />,
    ];

    return (
      <HttpsRedirect>
        <Router history={history}>
          {navbar}
          <Container style={{paddingBottom: '75px'}}>
            <Switch>
              {/* <Route key='route-random-word' path="/random/word" component={props => this.getRandom('words')} />
              <Route key='route-random-sentence' path="/random/sentence" component={props => this.getRandom('sentences', !canEdit)} />
              <Route key='route-random-article' path="/random/article" component={props => this.getRandom('articles')} /> */}
              <Route key='route-word' path="/words/:id" component={(props) => {
                let { id } = useParams();
                let { mode } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                if (mode == "edit") {
                  if (canEdit) {
                    return <WordEdit wordId={id} getUser={() => this.state.user} />
                  } else {
                    return history.push(`/article/${id}`);
                  }
                }
                return <WordWindow wordId={id} canEdit={canEdit} getUser={() => this.state.user} />;
              }} />
              <Route key='route-article' path="/articles/:id" component={(props) => {
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
              <Route 
                key='route-profile' path="/profile" component={(props) => {
                  return <UserWindow getUser={() => this.state.user} onDelete={() => {
                    this.handleLogout();
                  }} />
                }}
              />
              <Route 
                key='route-profile' path="/wordlist/:id/crossword" component={(props) => {
                  let { id } = useParams();
                  return <WordListCrossword wordlistId={id} />;
                }}
              />
              <Route 
                key='route-profile' path="/wordlist/:id" component={(props) => {
                  let { id } = useParams();
                  
                  let { mode } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                  if (mode == "edit") {
                    return <WordListEdit getUser={() => this.state.user} wordlistId={id}  />;
                  }
                  return <WordList getUser={() => this.state.user} wordlistId={id} />;
                }}
              />
              <Route 
                key='route-profile' path="/wordlist" component={(props) => {
                  return <WordListAll getUser={() => this.state.user} />
                }}
              />
              <Route 
                key='route-profile' path="/create/wordlist/" component={(props) => {
                  let { id } = useParams();
                  return <WordListNew getUser={() => this.state.user} />
                }}
              />
              <Route key='route-sentence' path="/sentences/:id" component={(props) => {
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
              <Route key='route-create-word' path="/create/word" component={(props) => {
                return canEdit ? <WordNew /> : <Redirect path='/' />;
              }} />
              <Route key='route-create-article' path="/create/article" component={(props) => {
                return canEdit ? <ArticleNew user={this.state.user} /> : <Redirect path='/' />;
              }} />
              <Route key='route-create-sentence' path="/create/sentence" component={(props) => {
                return canEdit ? <SentenceNew /> : <Redirect path='/' />;
              }} />
              <Route key='route-privacy' path="/privacy">
                <PrivacyPolicy />
              </Route>
              <Route key='route-help' path="/help">
                <Help />
              </Route>
              <Route key='route-about' path="/about">
                <About />
              </Route>
              <Route key='route-pronunciation' path="/pronunciation">
                <Pronunciation />
              </Route>
              <Route key='route-search' path="/search" 
                component={(props) => {
                  let { query, defaultTab, tags, pos } = qs.parse(props.location.search, { ignoreQueryPrefix: true });
                  return (
                    <SearchWindow 
                      query={query} 
                      timestamp={Date.now()} 
                      defaultTab={defaultTab} 
                      tags={tags}
                      pos={pos}
                    />
                  );
                }} 
              />
              <Route key='route-home' path="/">
                <Row>
                  <Col style={{textAlign: "center"}}>
                    <a href="/words/5eacb4f3dca21c60a0a90dde">
                      <img 
                        src="/brain-small-black.png" 
                        style={{width: "20%", height: "auto", marginTop: "0vh", marginBottom: "0vh"}}
                      />
                    </a>
                  </Col>
                </Row>
                <Row style={{marginTop: "0vh"}}>
                  <Col>
                    <SearchBar showRandomButtons autoFocus />
                  </Col>
                </Row>
              </Route>
            </Switch>
            <Navbar fixed="bottom" style={{opacity: "1", backgroundColor: "white"}} >
              <Nav key='nav-privacy'>
                <Nav.Link href="/privacy">Privacy Policy</Nav.Link>
              </Nav>
              <Nav key='nav-help'>
                <Nav.Link href="/help">Help</Nav.Link>
              </Nav>
              <Nav key='nav-contact' className='mr-auto'>
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
