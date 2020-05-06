
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, Modal } from 'react-bootstrap';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

import UserType from './UserType';
import PartOfSpeech from './PartOfSpeech';
import cookie from 'react-cookies';

import { remove_punctuation } from './helpers';

const { REACT_APP_API_URL } = process.env;

const api = axios.create({
    baseURL: REACT_APP_API_URL,
});

class WordWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            word: null,
            text: null,
            part_of_speech: null,
            definition: null,
            sentences: {},
            sentencesUpdates: {},
        };
    }

    componentDidMount() {
        this.getWord();
    }

    getWord() {
        api.get('/api/word/' + this.props.wordId, {
            headers: {signed_request: cookie.load('signed_request')},
        }).then(res => {
            if (res.status == 200) {
                let sentences = {};
                res.data.result.sentences.forEach(sentence => {
                    sentence.suggested = false;
                    sentences[sentence._id] = sentence;
                });
                this.setState({word: res.data.result});
                this.getSuggestedSentences(res.data.result, sentences);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
            this.setState({word: false});
        });
    }
   
    /**
     * 
     * @param {String} word 
     * @param {[Object]} sentences 
     */
    getSuggestedSentences(word, sentences) {
        api.get('/api/search/sentence', {
            headers: {signed_request: cookie.load('signed_request')},
            params: {
                query: remove_punctuation(word.text),
                language: 'paiute',
                mode: 'contains',
            }
        }).then(res => {
            if (res.status == 200) {
                if (res.data.result) {
                    res.data.result.forEach(sentence => {
                        if (sentences[sentence._id] == null) {
                            sentence.suggested = true;
                            sentences[sentence._id] = sentence;
                        }
                    });
                }
            } else {
                console.log(res.status, res.data);
            }
            this.setState({sentences: sentences})
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
                    <b>{sentenceToRemove.english}</b>
                    <p>{sentenceToRemove.paiute}</p>
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
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { text, part_of_speech, definition } = this.state;
        let body = {};
        if (text != null) body.text = text;
        if (part_of_speech != null) body.part_of_speech = part_of_speech;
        if (definition != null) body.definition = definition;

        if (Object.keys(body).length <= 0) return next(); // no update
        api.put('/api/word/' + this.props.wordId, 
            body, 
            {headers: {signed_request: cookie.load('signed_request')}}
        ).then(res => {
            if (res.status == 200) {
                next();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveSentence(sentenceId, next) { 
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { sentencesUpdates } = this.state;
        if (sentencesUpdates[sentenceId] == null) return next(); // No update
        let body = {};
        if (sentencesUpdates[sentenceId].paiute) body.paiute = sentencesUpdates[sentenceId].paiute;
        if (sentencesUpdates[sentenceId].english) body.english = sentencesUpdates[sentenceId].english;
        if (!body) return next(); // No update
        api.put('/api/sentence/' + sentenceId,
            body,
            {headers: {signed_request: cookie.load('signed_request')}}
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
            {headers: {signed_request: cookie.load('signed_request')}}
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
    changeSentence(language, sentenceId, value) {
        let { sentencesUpdates } = this.state;
        if (!sentencesUpdates[sentenceId]) {
            sentencesUpdates[sentenceId] = {}
        }
        sentencesUpdates[sentenceId][language] = value;
        this.setState({sentencesUpdates: sentencesUpdates});
    }

    toggleSuggested(sentence) {
        let { word } = this.state;
        if (!word) return; // word not loaded yet
        let request;
        if (sentence.suggested) {
            request = api.post(`/api/word/${word._id}/sentence`,
                {sentence: sentence._id}, 
                {headers: {signed_request: cookie.load('signed_request')}}
            );
        } else {
            request = api.delete(`/api/word/${word._id}/sentence/${sentence._id}`,
                {headers: {signed_request: cookie.load('signed_request')}}
            );
        }
        request.then(res => {
            if (res.status == 200) {
                this.getWord();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    /**
     * 
     * @param {String} sentence 
     */
    sentenceForm(sentence) {
        let hasChanged = this.hasSentenceChanged(sentence._id);
        return (
            <Form>

                <Form.Group controlId={`form-sentence-paiute-${sentence._id}`}>
                    <Form.Label>Paiute</Form.Label>
                    <Form.Control as="textarea" defaultValue={sentence.paiute} 
                        onChange={e => this.changeSentence('paiute', sentence._id, e.target.value)}
                    />
                </Form.Group>

                <Form.Group controlId={`form-sentence-english-${sentence._id}`}>
                    <Form.Label>English</Form.Label>
                    <Form.Control as="textarea" defaultValue={sentence.english} 
                        onChange={e => this.changeSentence('english', sentence._id, e.target.value)}
                    />
                </Form.Group>

                <ButtonGroup className='d-flex'>
                    <Button 
                        variant={hasChanged ? 'outline-primary' : 'outline-secondary'} 
                        href='#'
                        className='w-100'
                        disabled={!hasChanged}
                        onClick={e => this.saveSentence(sentence._id, () => this.getWord())}
                    >
                        Save
                    </Button>
                    <Button 
                        variant='outline-info' href='#'
                        className='w-100'
                        onClick={e => this.toggleSuggested(sentence)}
                    >
                        <FontAwesomeIcon icon={sentence.suggested ? faCheck : faTimes} className='mr-2' />
                        {sentence.suggested ? "Approve" : "Un-approve"}
                    </Button>
                    <Button 
                        variant='outline-danger' href='#'
                        className='w-100'
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

    sentenceSimple(sentence) {
        return (
            <div>
                <b>{sentence.paiute}</b>
                <p>{sentence.english}</p>
            </div>  
        );
    }
    
    wordForm(word) {
        let part_of_speech_option = word.part_of_speech.toLowerCase().replace('_', ' ');
        let posOptions = PartOfSpeech.map((part_of_speech, i) => {
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
                            {posOptions}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId='formDefinition'>
                        <Form.Label>Definition</Form.Label>
                        <Form.Control as="textarea" defaultValue={word.definition} 
                            onChange={e => this.changeDefinition(e.target.value)}
                        />
                    </Form.Group>

                    <Button 
                            variant={hasChanged ? 'outline-primary' : 'outline-secondary'} 
                            block href='#'
                            disabled={!hasChanged}
                            onClick={e => this.saveWord(() => this.getWord())}
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
                <p>{word.definition}</p>
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
        return definition != null && definition != word.definition;
    }

    hasSentenceChanged(sentenceId) {
        let { sentencesUpdates, sentences } = this.state;

        let s_new = sentencesUpdates[sentenceId];
        let s_old = sentences[sentenceId];
        // Invalid sentence or never updated
        if (s_new == null || s_old == null) return false;

        return (s_new.paiute != null && s_new.paiute != s_old.paiute) || (s_new.english != null && s_new.english != s_old.english);
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
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }
        api.post('/api/sentence', 
            {'paiute': '', 'english': ''},
            {headers: {signed_request: cookie.load('signed_request')}}
        ).then(res => {
            if (res.status != 200 || res.data.success == false) {
                console.log(res.status, res.data);
            } else {
                let { word } = this.state;
                if (word == null) {
                    console.error('Cannot add sentence to invalid word.');
                    return;
                }
                api.post('/api/word/' + this.props.wordId + '/sentence',
                    {sentence: res.data.result._id},
                    {headers: {signed_request: cookie.load('signed_request')}}
                ).then(res => {
                    if (res.status == 200) {
                        this.getWord();
                    } else {
                        console.log(res.status, res.data);
                    }
                }).catch(err => console.error(err));
            }
        }).catch(err => {
            console.error(err);
        });
    }

    render() {
        let { word, sentences } = this.state;
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

        let regSentences = [];
        let suggSentences = [];
        Object.entries(sentences).forEach(([_, sentence]) => {
            let listItem = (
                <ListGroup.Item key={'sentence-' + sentence._id}>
                    {editMode ? this.sentenceForm(sentence) : this.sentenceSimple(sentence)}
                </ListGroup.Item>
            );
            if (sentence.suggested == true) {
                suggSentences.push(listItem);
            } else {
                regSentences.push(listItem);
            }
        });

        let [sentencesList, suggSentencesList] = [[regSentences, 'Sentences'], [suggSentences, 'Suggested Sentences']].map(([listItems, title], _) => {
            if (listItems.length <= 0) {
                return null;
            } else {
                return (
                    <Row>
                        <Col>
                            <h5 className='text-center'>{title}</h5>
                            <ListGroup variant='flush'>
                                {listItems}
                            </ListGroup>
                        </Col>
                    </Row>
                );
            }
        });

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
        
        let relatedWords = word.words.map((word, i) => {

            return (
                <ListGroup.Item action href={'/word/' + word._id}>
                    <Row>
                        <Col 
                            style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}}
                            className='text-right'
                        >
                            <p>{word.text}</p>
                        </Col>
                        <Col>
                            <em>{word.part_of_speech.toLowerCase().replace('_', ' ')}</em>
                        </Col>
                    </Row>
                </ListGroup.Item>
            );
        });

        let relatedWordsList;
        if (relatedWords.length > 0) {
            relatedWordsList = (
                <Row className='mt-3'>
                    <Col>
                        <h5 className='text-center'>See Also</h5>
                        <ListGroup variant='flush'>{relatedWords}</ListGroup>
                    </Col>
                </Row>
            );
        }

        let wordBody = (
            <Row>
                <Col sm={12} md={4} >
                    {editMode ? this.wordForm(word) : this.wordSimple(word)}
                    {relatedWordsList}
                </Col>
                <Col xs={0} style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}} className='d-none d-md-block d-xl-block'></Col>
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