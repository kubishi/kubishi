
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
            word: null,
            suggestedSentences: [],
        };

        this.getWord(this.props.wordId);
    }

    getWord(wordId) {
        api.get('/api/word/' + wordId, {
            headers: {api_key: API_KEY},
            params: {
                'populate': true,
            }
        }).then(res => {
            if (res.status == 200) {
                this.setState({word: res.data.result});
                this.getSuggestedSentences(res.data.result);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
            this.setState({word: false});
        });
    }

    getSuggestedSentences(word) {
        api.get('/api/search/sentence', {
            headers: {api_key: API_KEY},
            params: {
                query: '.*\b' + word.text + '\b.*',
                populate: true,
                is_paiute: true,
                mode: 'regex',
            }
        }).then(res => {
            if (res.status == 200) {
                this.setState({suggestedSentences: res.data.sentences})
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { word } = this.state;
        if (word == null) {
            return null;
        } else if (word == false) {
            return (
                <div className='mt-3 text-center'>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        return (
            <Row className='mt-3'>
                <Col style={{'padding-right': '20px', 'border-right': '1px solid #ccc'}}>
                    <h4>{word.text}</h4>
                    <p><em>{word.part_of_speech}</em></p>
                    <p>{word.definition.text}</p>
                </Col>
                <Col>
                    <h5 className='text-center'>Sentences</h5>
                </Col>
            </Row>
        );
    }
}

export default WordWindow;