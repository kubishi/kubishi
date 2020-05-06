
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

import UserType from './UserType';
import PartOfSpeech from './PartOfSpeech';

import Select from 'react-select';

import { remove_punctuation } from './helpers';
import api from './Api';

class WordWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editMode: false,
            word: null,
            text: null,
            part_of_speech: null,
            definition: null,
            sentences: {},
            sentencesUpdates: {},
            related_options: [],
        };
    }

    componentDidMount() {
        this.getWord();
    }

    getWord() {
        api.get('/api/word/' + this.props.wordId).then(res => {
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

    saveWord() { 
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { text, part_of_speech, definition } = this.state;
        let body = {};
        if (text != null) body.text = text;
        if (part_of_speech != null) body.part_of_speech = part_of_speech;
        if (definition != null) body.definition = definition;

        if (Object.keys(body).length <= 0) return; // no update
        api.put('/api/word/' + this.props.wordId, body).then(res => {
            if (res.status == 200) {
                this.getWord();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveSentence(sentenceId) { 
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { sentencesUpdates } = this.state;
        if (sentencesUpdates[sentenceId] == null) return; // No update
        let body = {};
        if (sentencesUpdates[sentenceId].paiute) body.paiute = sentencesUpdates[sentenceId].paiute;
        if (sentencesUpdates[sentenceId].english) body.english = sentencesUpdates[sentenceId].english;
        if (!body) return; // No update
        api.put('/api/sentence/' + sentenceId, body).then(res => {
            if (res.status == 200) {
                return this.getWord();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
        
    }

    removeSentence(sentenceId) {
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        if (sentenceId == null) return;
        api.delete('/api/sentence/' + sentenceId).then(res => {
            if (res.status == 200) {
                return this.getWord();
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
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { word } = this.state;
        if (!word) return; // word not loaded yet
        let request;
        if (sentence.suggested) {
            request = api.post(`/api/word/${word._id}/sentence`,
                {sentence: sentence._id}
            );
        } else {
            request = api.delete(`/api/word/${word._id}/sentence/${sentence._id}`);
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
                        variant={hasChanged ? 'outline-success' : 'outline-secondary'} 
                        href='#'
                        className='w-100'
                        disabled={!hasChanged}
                        onClick={e => this.saveSentence(sentence._id, () => this.getWord())}
                    >
                        Save
                    </Button>
                    <Button 
                        variant='outline-warning' href='#'
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
                            if (window.confirm('Are you sure you want to delete this sentence?')) {
                                this.removeSentence(sentence._id)
                            }
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

    deleteWord() {
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { word } = this.state;
        if (!word) return; // word has not loaded yet

        api.delete(`/api/word/${word._id}`).then(res => {
            window.location.href = '/';
        }).catch(err => console.error(err));
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
                        variant={hasChanged ? 'outline-success' : 'outline-secondary'} 
                        block href='#'
                        disabled={!hasChanged}
                        onClick={e => this.saveWord()}
                    >
                        Save
                    </Button>

                    <Button 
                        variant='outline-danger'
                        block href='#'
                        onClick={e => {
                            if (window.confirm('Are you sure you want to delete this word?')) {
                                this.deleteWord();
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faTrash} className='mr-2' />
                        Delete
                    </Button>
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
            {'paiute': '', 'english': ''}
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
                    {sentence: res.data.result._id}
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

    addRelatedWord(addWord) {
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { word } = this.state;
        if (!addWord || !word) return;

        api.post(`/api/word/${word._id}/related`,
            {word: addWord.value}
        ).then(res => this.getWord()).catch(err => console.log(err));
    }

    updateRelatedOptions(query) {
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        if (!query) return;
        api.get('/api/search/word', 
            {
                params: { 
                    query: query + '.*', 
                    mode: 'regex', 
                    language: 'paiute'
                }
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({related_options: []});
            } else if (res.data.result.length <= 0) {
                this.setState({related_options: []});
            } else {
                console.log(res.data.result);
                let options = res.data.result.map((word, i) => {
                    return {value: word._id, label: word.text};
                });
                this.setState({related_options: options});
            }
        }).catch(err => console.error(err));
    }

    removeRelatedWord(wordId) {
        if (!this.canEdit()) {
            console.error("This user cannot make edits!")
            return;
        }

        let { word } = this.state;
        if (!word || !wordId) return; // word not loaded yet
        api.delete(`/api/word/${word._id}/related/${wordId}`).then(res => {
            if (res.status == 200) {
                this.getWord();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { word, sentences, editMode } = this.state;

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
        
        if (editMode) {
            regSentences.push(
                <ListGroup.Item key={'sentence-add-button'} >
                    <Button 
                        variant='outline-primary'
                        onClick={e => this.addSentence()}
                        block
                    >
                        <FontAwesomeIcon icon={faPlus} className='mr-2' />
                        Add Sentence
                    </Button>
                </ListGroup.Item>
            );
        }

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
        
        let relatedWords = word.words.map((word, i) => {
            if (editMode) {
                return (
                    <ListGroup.Item key={`related-word-${word._id}`}>
                        <Row>
                            <Col>
                                <Button variant='outline-danger' onClick={e => {
                                    if (window.confirm('Are you sure you want to remove this related word?')) {
                                        this.removeRelatedWord(word._id);
                                    }
                                }}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </Button>
                            </Col>
                            <Col 
                                style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}}
                                className='text-right'
                            >
                                <a href={'/word/' + word._id}><p>{word.text}</p></a>
                            </Col>
                            <Col>
                                <em>{word.part_of_speech.toLowerCase().replace('_', ' ')}</em>
                            </Col>
                        </Row>
                    </ListGroup.Item>
                );
            } else {
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
            }
        });
        
        let addRelated;
        if (editMode) {
            addRelated = (
                <div className='mt-3'>
                    <Select 
                        placeholder='Add Related Word...'
                        // isSearchable={true}
                        options={this.state.related_options}
                        onChange={(selected) => this.addRelatedWord(selected)}
                        onInputChange={query => this.updateRelatedOptions(query)}
                    />
                </div>
            );
        }

        let relatedWordsList;
        if (relatedWords.length > 0 || addRelated) {
            let listGroup = <ListGroup variant='flush'>{relatedWords}</ListGroup>;
            relatedWordsList = (
                <Row className='mt-3'>
                    <Col>
                        <h5 className='text-center'>See Also</h5>
                        {addRelated}
                        {listGroup}
                    </Col>
                </Row>
            );
        }

        let editToggle;
        if (this.canEdit()) {
            editToggle = (
                <Form className='mb-2 float-right'>
                    <Form.Check 
                        type="switch"
                        id="edit-switch"
                        label="Edit Mode"
                        onChange={e => this.setState({editMode: e.target.checked})}
                    />
                </Form>
            );
        }
        
        let wordBody = (
            <Row>
                <Col sm={12} md={4} >
                    {editToggle}
                    {editMode ? this.wordForm(word) : this.wordSimple(word)}
                    {relatedWordsList}
                </Col>
                <Col xs={0} style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}} className='d-none d-md-block d-xl-block'></Col>
                <Col>
                    {sentencesList}
                    {suggSentencesList}
                </Col>
            </Row>
        );
        return (
            <Row className='m-3'>
                <Col>
                    {wordBody}
                </Col>
            </Row>
        );
    }
}

export default WordWindow;