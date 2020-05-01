
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, Modal } from 'react-bootstrap';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

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
            text: null,
            part_of_speech: null,
            definition: null,
            suggestedSentences: [],
            sentencesUpdates: {},
        };
    }

    componentDidMount() {
        this.getWord();
    }

    getWord() {
        api.get('/api/word/' + this.props.wordId, {
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

    getDeleteSentenceModal() {
        let { sentenceToRemove } = this.state;

        let body;
        if (sentenceToRemove != null) {
            body = (
                <div>
                    <b>{sentenceToRemove.text}</b>
                    <p>{sentenceToRemove.translation.text}</p>
                </div>
            );
        }
        
        return (
            <Modal 
                show={sentenceToRemove != null} 
                onHide={() => this.setState({sentenceToRemove: null})}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Are you sure?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant='outline-primary' 
                        onClick={() => this.setState({sentenceToRemove: null})}>
                    Close
                    </Button>
                    <Button 
                        variant='outline-danger' 
                        onClick={() => this.removeSentence(sentenceToRemove._id, () => {
                            this.setState({sentenceToRemove: null});
                            this.getWord();
                        })}
                    >
                        <FontAwesomeIcon icon={faTrash} className='mr-2' />
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    saveWord(next) {
        let { text, part_of_speech } = this.state;
        let body = {};
        if (this.hasTextChanged()) {
            body.text = text;
        }
        if (this.hasPosChanged()) {
            body.part_of_speech = part_of_speech;
        }

        if (Object.keys(body).length <= 0) {
            return next();
        }

        api.put('/api/word/' + this.props.wordId, body, {
            headers: {api_key: API_KEY}
        }).then(res => {
            if (res.status == 200) {
                next();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveDefinition(next) {
        if (!this.hasDefChanged()) {
            return next();
        }

        let { definition } = this.state;

        api.put('/api/word/' + this.props.wordId + '/definition',
            {'text': definition}, {headers: {api_key: API_KEY}}
        ).then(res => {
            if (res.status == 200) {
                next();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveSentence(sentenceId, next) {
        if (!this.hasSentenceChanged(sentenceId)) {
            return next();
        }

        let { sentencesUpdates } = this.state;
        api.put('/api/sentence/' + sentenceId,
            {'text': sentencesUpdates[sentenceId]}, 
            {headers: {api_key: API_KEY}}
        ).then(res => {
            if (res.status == 200) {
                return next();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
        
    }

    removeSentence(sentenceId, next) {
        if (sentenceId == null) return;
        api.delete('/api/sentence/' + sentenceId,
            {headers: {api_key: API_KEY}}
        ).then(res => {
            if (res.status == 200) {
                return next();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    canEdit() {
        let user = this.props.getUser();
        if (user != null && UserType[user.type] != null && UserType[user.type] >= UserType.EDITOR) {
            return true;
        }
        return false;
    }

    /**
     * 
     * @param {String} sentenceId 
     * @param {String} value 
     */
    changeSentence(sentenceId, value) {
        let { sentencesUpdates } = this.state;
        sentencesUpdates[sentenceId] = value;
        this.setState({sentencesUpdates: sentencesUpdates});
    }

    sentenceForm(sentence, i) {
        let hasChanged = this.hasSentenceChanged(sentence._id) || this.hasSentenceChanged(sentence.translation._id);
        return (
            <Form>

                <Form.Group controlId={`form-sentence-${i}`}>
                    <Form.Label>Sentence</Form.Label>
                    <Form.Control as="textarea" defaultValue={sentence.text} 
                        onChange={e => this.changeSentence(sentence._id, e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId={`form-translation-${i}`}>
                    <Form.Label>Translation</Form.Label>
                    <Form.Control as="textarea" defaultValue={sentence.translation.text} 
                        onChange={e => this.changeSentence(sentence.translation._id, e.target.value)}
                    />
                </Form.Group>

                <ButtonGroup className='d-flex'>
                    <Button 
                        variant={hasChanged ? 'outline-primary' : 'outline-secondary'} 
                        href='#'
                        className='w-100'
                        disabled={!hasChanged}
                        onClick={e => {
                            this.saveSentence(sentence._id, () => {
                                this.saveSentence(sentence.translation._id, () => {
                                    this.getWord();
                                });
                            });
                        }}
                    >
                        Save
                    </Button>
                    <Button 
                        variant='outline-danger' href='#'
                        className='w-25'
                        onClick={e => {
                            this.setState({sentenceToRemove: sentence});
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} className='mr-2' />
                        Delete
                    </Button>
                </ButtonGroup>
                

            </Form>
        );
    }

    sentenceSimple(sentence, id) {
        return (
            <div>
                <b>{sentence.text}</b>
                <p>{sentence.translation.text}</p>
            </div>  
        );
    }
    
    wordForm(word) {
        let part_of_speech_option = word.part_of_speech.toLowerCase().replace('_', ' ');
        let user_options = parts_of_speech.map((part_of_speech, i) => {
            let pos = part_of_speech.toLowerCase().replace('_', ' ');
            return (
                <option key={'option-pos-' + i}>{pos}</option>
            );
        });
        let hasChanged = this.hasTextChanged() || this.hasPosChanged() || this.hasDefChanged();
        return (
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
                            onClick={e => {
                                this.saveWord(() => {
                                    this.saveDefinition(() => {
                                        this.getWord();
                                    });
                                });
                            }}
                        >Save</Button>
                </Form>
            </div>
        );
    }

    wordSimple(word) {
        let part_of_speech_option = word.part_of_speech.toLowerCase().replace('_', ' ');
        return (
            <div>
                <h4>{word.text}</h4>
                <p><em>{part_of_speech_option}</em></p>
                <p>{word.definition.text}</p>
            </div>
        );
    }

    hasTextChanged() {
        let { word, text } = this.state;
        return text != null && text != word.text;
    }

    hasPosChanged() {
        let { word, part_of_speech } = this.state;
        return part_of_speech != null && part_of_speech != word.part_of_speech;
    }

    hasDefChanged() {
        let { word, definition } = this.state;
        return definition != null && definition != word.definition.text;
    }

    hasSentenceChanged(sentenceId) {
        let { sentencesUpdates, word, suggestedSentences } = this.state;
        let all_sentences = word.sentences.concat(suggestedSentences);
        let sentence = all_sentences.find(sentence => sentence._id == sentenceId);
        let sentenceText;
        if (sentence == null) {
            sentence = all_sentences.find(sentence => sentence.translation._id == sentenceId);
            if (sentence == null) { // no matching sentence found
                return false;
            }
            sentenceText = sentence.translation.text;
        } else {
            sentenceText = sentence.text;
        }
        return sentencesUpdates[sentenceId] != null && sentencesUpdates[sentenceId] != sentenceText;
    }

    hasAnySentenceChanged() {
        let { sentencesUpdates } = this.state;
        return Object.keys(sentencesUpdates).some(sentenceId => {
            return this.hasSentenceChanged(sentenceId);
        });
    }

    hasChanged() {
        return (
            this.hasTextChanged() || this.hasPosChanged() ||
            this.hasDefChanged() || this.hasAnySentenceChanged()
        );
    }

    addSentence() { 
        api.post('/api/sentence', 
            {'paiute': '', 'english': ''},
            {headers: {api_key: API_KEY}}
        ).then(res => {
            if (res.status == 200) {
                let { word } = this.state;
                if (word == null) {
                    console.error('Cannot add sentence to invalid word.');
                    return;
                }
                let sentenceId = res.data.result.find(s => s.is_paiute==word.is_paiute)._id;
                api.post('/api/word/' + this.props.wordId + '/sentence',
                    {sentence: sentenceId},
                    {headers: {api_key: API_KEY}}
                ).then(res => {
                    if (res.status == 200) {
                        this.getWord();
                    } else {
                        console.log(res.status, res.data);
                    }
                }).catch(err => console.error(err));
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    render() {
        let { word, suggestedSentences } = this.state;
        let editMode = this.canEdit();

        if (word == null) {
            return null;
        } else if (word == false) {
            return (
                <div className='mt-3 text-center'>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        let sentenceIds = word.sentences.map((sentence, i) => sentence._id);
        let sentences = word.sentences
            .sort((a, b) => ((a.text == null ? 0 : a.text.length) - (b.text == null ? 0 : b.text.length)))
            .map((sentence, i) => {
                let listItems = editMode ? this.sentenceForm(sentence, i) : this.sentenceSimple(sentence, i);
                return <ListGroup.Item key={'sentence-' + sentence._id}>{listItems}</ListGroup.Item>;
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

        let suggSentences = suggestedSentences
            .filter(sentence => !sentenceIds.includes(sentence._id))
            .map((sentence, i) => {
                let listItems = editMode ? this.sentenceForm(sentence, i) : this.sentenceSimple(sentence, i);
                return <ListGroup.Item key={'sentence-' + sentence._id}>{listItems}</ListGroup.Item>;
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

        let addSentenceButton;
        if (editMode) {
            addSentenceButton = (
                <Row>
                    <Col>
                        <Button 
                            className='float-right'
                            variant='outline-primary'
                            onClick={e => this.addSentence()}
                        >
                            <FontAwesomeIcon icon={faPlus} className='mr-2' />
                            Add Sentence
                        </Button>
                    </Col>
                </Row>
            );
        }

        let wordBody = (
            <Row>
                <Col 
                    xs={4}
                    style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}}
                >
                    {editMode ? this.wordForm(word) : this.wordSimple(word)}
                </Col>
                <Col>
                    {addSentenceButton}
                    {sentencesList}
                    {suggSentencesList}
                </Col>
            </Row>
        );
        return (
            <Row className='m-3'>
                <Col>
                    {this.getDeleteSentenceModal()}
                    {wordBody}
                </Col>
            </Row>
        );
    }
}

export default WordWindow;