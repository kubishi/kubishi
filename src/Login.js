
import { FACEBOOK_APP_ID, API_URL } from './env';

import React from 'react';
import FacebookLogin from 'react-facebook-login';
import './Login.css';


import { 
    Button, Jumbotron, Container, 
    Row, Col, InputGroup, FormControl,
    ListGroup
} from 'react-bootstrap';

class LoginComponent extends React.Component {
    render() {
        return (
            <FacebookLogin
                appId={FACEBOOK_APP_ID}
                autoLoad={true}
                fields="name,email,picture"
                callback={this.props.responseFacebook}
                cssClass="btn btn-default my-facebook-button-class"
            />
        );
    }

}

export default LoginComponent;