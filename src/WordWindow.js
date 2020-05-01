
import React from 'react';
import { Row, Col, ListGroup, Form, Button } from 'react-bootstrap';
import axios from 'axios';

import { API_URL, API_KEY } from './env';

const api = axios.create({
    baseURL: API_URL,
});

const parts_of_speech = [
    'NOUN',
    'VERB',
    'IDIOM',
    'ADVERB',
    'PRONOUN',
    'ADJECTIVE',
    'NOUN_SUFFIX',
    'VERB_SUFFIX',
    'PREPOSITION',
    'POSTPOSITION',
    'UNKNOWN',
];

const UserType = {
  USER: 1,
  EDITOR: 2,
  DEVELOPER: 3,
  ADMIN: 4
};

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

    /**
     * 
     * @param {String} e 
     */
    changePartOfSpeech(part_of_speech) {
        this.setState({part_of_speech: part_of_speech.toUpperCase().replace(' ', '_')});
    }

    /**
     * 
     * @param {String} text 
     */
    changeWordText(text) {
        this.setState({text: text});
    }

    /**
     * 
     * @param {String} text 
     */
    changeDefinition(definition) {
        this.setState({definition: definition});
    }

    handleSave(e) {
        let { text, part_of_speech, definition } = this.state;

        if (!this.canEdit()) {
            console.error("User does not have permission to edit.");
            return;
        }

        let body = {};
        if (text != null) body.text = text;
        if (part_of_speech != null) body.part_of_speech = part_of_speech;
        if (text != null || part_of_speech != null) {
            api.put('/api/word/' + this.props.wordId, body, {
                headers: {api_key: API_KEY}
            }).then(res => {
                if (res.status == 200) {
                    this.getWord(this.props.wordId);
                } else {
                    console.log(res.status, res.data);
                }
            }).catch(err => console.error(err));
        }
        
        if (definition != null) {
            api.put('/api/word/' + this.props.wordId + '/definition',
                {'text': definition}, {headers: {api_key: API_KEY}}
            ).then(res => {
                if (res.status == 200) {
                    this.getWord(this.props.wordId);
                } else {
                    console.log(res.status, res.data);
                }
            }).catch(err => console.error(err));
        }
    }

    canEdit() {
        let user = this.props.getUser();
        if (user != null && UserType[user.type] != null && UserType[user.type] >= UserType.EDITOR) {
            return true;
        }
        return false;
    }

    render() {
        let { word, suggestedSentences } = this.state;
        let edit_mode = this.canEdit();

        if (word == null) {
            return null;
        } else if (word == false) {
            return (
                <div className='mt-3 text-center'>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        let user_options = parts_of_speech.map((part_of_speech, i) => {
            let pos = part_of_speech.toLowerCase().replace('_', ' ');
            return (
                <option>{pos}</option>
            );
        });

        let sentence_ids = word.sentences.map((sentence, i) => sentence._id);
        let sentences = word.sentences.map((sentence, i) => {
            if (edit_mode) {
                return (
                    <ListGroup.Item>
                        <b>{sentence.text}</b>
                        <p>{sentence.translation.text}</p>
                    </ListGroup.Item>
                );
            } else {
                return (
                    <ListGroup.Item>
                        <b>{sentence.text}</b>
                        <p>{sentence.translation.text}</p>
                    </ListGroup.Item>
                );
            }
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

        let wordPart;
        let part_of_speech_option = word.part_of_speech.toLowerCase().replace('_', ' ');
        let { text, part_of_speech, definition } = this.state;
        let hasChanged = (
            (text != null && text != word.text) ||
            (part_of_speech != null && part_of_speech != word.part_of_speech) ||
            (definition != null && definition != word.definition.text)
        );
        if (edit_mode) {
            wordPart = (
                <div>
                    <Form>
                        <Form.Group controlId='formWord'>
                            <Form.Label>Word</Form.Label>
                            <Form.Control 
                                type='text' defaultValue={word.text}
                                onChange={e => {this.changeWordText(e.target.value)}}
                            />
                        </Form.Group>

                        <Form.Group controlId='formPOS'>
                            <Form.Label>Part of Speech</Form.Label>
                            <Form.Control 
                                as="select" 
                                defaultValue={part_of_speech_option} 
                                onChange={e => {this.changePartOfSpeech(e.target.value)}}
                            >
                                {user_options}
                            </Form.Control>
                        </Form.Group>

                        <Form.Group controlId='formDefinition'>
                            <Form.Label>Definition</Form.Label>
                            <Form.Control as="textarea" defaultValue={word.definition.text} 
                                onChange={e => this.changeDefinition(e.target.value)}
                            />
                        </Form.Group>

                        <Button 
                            variant={hasChanged ? 'outline-primary' : 'outline-secondary'} 
                            block href='#'
                            disabled={!hasChanged} 
                            onClick={e => this.handleSave(e)}
                        >Save</Button>
                    </Form>
                </div>
            );
        } else {
            wordPart = (
                <div>
                    <h4>{word.text}</h4>
                    <p><em>{part_of_speech_option}</em></p>
                    <p>{word.definition.text}</p>
                </div>
            );
        }

        return (
            <Row className='m-3'>
                <Col 
                    xs={4}
                    style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}}
                >
                    {wordPart}
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