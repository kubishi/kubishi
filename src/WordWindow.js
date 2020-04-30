
import React from 'react';
import { 
  Button, ButtonGroup, Jumbotron, Container, 
  Row, Col, InputGroup, FormControl,
  ListGroup, Form, DropdownButton, Dropdown,
  FormGroup, Spinner,
} from 'react-bootstrap';
import axios from 'axios';

import {
    BrowserRouter as Router,
    Switch, useParams,
    Route, Link, useRouteMatch
} from "react-router-dom";

import { API_URL, API_KEY } from './env';

const api = axios.create({
    baseURL: API_URL,
})

class WordWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            word: null
        };

        api.get('/api/word/' + this.props.wordId, {
            headers: {api_key: API_KEY}
        }).then(res => {
            if (res.status == 200) {
                this.setState({word: res.data.result});
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
            this.setState({word: false});
        });

    }

    render() {
        let { word } = this.state;
        if (word == null) {
            return (
                <Spinner animation="border" role="status" 
                    className='mt-2 text-center'
                >
                    <span className="sr-only">Loading...</span>
                </Spinner>
            );
        } else if (word == false) {
            return (
                <div>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        return (
            <p>{JSON.stringify(word)}</p>
        );
    }
}

export default WordWindow;