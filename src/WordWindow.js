
import React from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';
import axios from 'axios';

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
    }

    componentDidMount() {
        this.getWord(this.props.wordId);
    }

    getWord(wordId) {
        api.get('/api/word/' + wordId, {
            headers: {api_key: API_KEY},
            params: {
                populate: true,
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
                query: word.text,
                populate: true,
                is_paiute: true,
                mode: 'contains',
            }
        }).then(res => {
            if (res.status == 200) {
                if (res.data.result) {
                    this.setState({suggestedSentences: res.data.result})
                }
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { word, suggestedSentences } = this.state;
        if (word == null) {
            return null;
        } else if (word == false) {
            return (
                <div className='mt-3 text-center'>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        let sentence_ids = word.sentences.map((sentence, i) => sentence._id);
        let sentences = word.sentences.map((sentence, i) => {
            return (
                <ListGroup.Item>
                    <b>{sentence.text}</b>
                    <p>{sentence.translation.text}</p>
                </ListGroup.Item>
            );
        });
        
        let sentencesList = null;
        if (sentences.length > 0) {
            sentencesList = (
                <Row>
                    <Col>
                        <h5 className='text-center'>Sentences</h5>
                        <ListGroup variant='flush'>
                            {sentences}
                        </ListGroup>
                    </Col>
                </Row>
            );
        }

        suggestedSentences = suggestedSentences;
        let suggSentences = suggestedSentences
            .filter(sentence => !sentence_ids.includes(sentence._id))
            .map((sentence, i) => {
                return (
                    <ListGroup.Item>
                        <b>{sentence.text}</b>
                        <p>{sentence.translation.text}</p>
                    </ListGroup.Item>
                );
            });

        let suggSentencesList = null;
        if (suggSentences.length > 0) {
            suggSentencesList = (
                <Row>
                    <Col>
                        <h5 className='text-center'>Suggested Sentences</h5>
                        <ListGroup variant='flush'>
                            {suggSentences}
                        </ListGroup>
                    </Col>
                </Row>
            );
        }

        let part_of_speech = word.part_of_speech.toLowerCase().replace('_', ' ');
        return (
            <Row className='m-3'>
                <Col 
                    xs={4}
                    style={{paddingRight: '20px', borderRight: '1px solid #ccc'}}
                >
                    <h4>{word.text}</h4>
                    <p><em>{part_of_speech}</em></p>
                    <p>{word.definition.text}</p>
                </Col>
                <Col>
                    {sentencesList}
                    {suggSentencesList}
                </Col>
            </Row>
        );
    }
}

export default WordWindow;