
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheck, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';

import api from './Api';
import AudioInput from './AudioInput';
import ImageInput from './ImageInput';
import { getUpdates, replaceSpecialChars, getPosLabel } from './helpers';

import './SentenceForm.css';

class WordSearch extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            options: [],
            query: null
        }
    }

    updateOptions() {
        let { query } = this.state;
        if (query == null || query == '') return; // empty query
        api.get('/api/search/word', 
            {
                params: {
                    query: query, 
                    mode: 'fuzzy',
                    fields: ['text', 'part_of_speech', 'definition'],
                    searchFields: ['text', 'definition']
                }
            }
        ).then(res => {
            if (res.status == 200 && res.data.success) {
                let options = res.data.result.map(word => {
                    return {value: word, label: `${word.text} (${getPosLabel(word.part_of_speech)}): ${word.definition}`}
                });
                this.setState({ options });
            } else {
                console.log(res.status, res.data);
                this.setState({ options: [] });
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { options, query } = this.state;
        let { onSelect } = this.props;

        return (
            <Select 
                placeholder='Search for word...'
                options={options}
                inputValue={query}
                onChange={selected => onSelect(selected.value)}
                onInputChange={query => this.setState({ query: replaceSpecialChars(query) }, () => this.updateOptions())}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                menuPortalTarget={document.body}
            />
        );
    }
};


class SentenceForm extends React.Component {
    constructor(props) {
        super(props);

        let sentence = (this.props.sentence || {});
        this.state = {
            english: sentence.english || null,
            paiute: sentence.paiute || null,
            audio: sentence.audio || {data: null, filename: null},
            image: sentence.image || {data: null, filename: null},

            words: [],
            selectingIdx: null,
            selectingMode: null,
        }
    }
    
    hasChanged() {
        let { english, paiute } = this.state;
        let { sentence } = this.props;

        if (sentence == null) {
            return english != null && paiute != null;
        }
        
        return Object.keys(getUpdates(sentence, this.state)).length > 0;
    }

    save() {
        if (!this.hasChanged()) return;
        let { postSave } = this.props;
        let sentence = this.props.sentence || {};

        let body = {};
        [ 'english', 'paiute', 'audio' ].forEach(key => {
            if (this.state[key] != sentence[key]) {
                body[key] = this.state[key];
            }
        });

        let request;
        if (sentence._id != null) { // word exists
            request = api.put(`/api/sentence/${sentence._id}`, body);
        } else {
            request = api.post('/api/sentence', body);
        }

        request.then(res => {
            if (res.status == 200) {
                if (postSave != null) {
                    return postSave();
                }
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    toggleApprove() {
        let { sentence, postApprove } = this.props;
        if (sentence == null || sentence.wordId == null || sentence.suggested == null) return;
        let request;
        if (sentence.suggested) {
            request = api.post(`/api/word/${sentence.wordId}/sentence`,
                {sentence: sentence._id}
            );
        } else {
            request = api.delete(`/api/word/${sentence.wordId}/sentence/${sentence._id}`);
        }
        request.then(res => {
            if (res.status == 200) {
                if (postApprove != null) {
                    return postApprove();
                }
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    delete() {
        let { sentence, postDelete } = this.props;
        if (sentence != null) {
            api.delete(`/api/sentence/${sentence._id}`).then(res => {
                if (res.status == 200 && postDelete != null) {
                    return postDelete();
                } else {
                    console.log(res.status, res.data);
                }
            }).catch(err => console.error(err));
        }
    }

    annotateForm() {
        let { english, paiute, words, selectingIdx, selectingMode } = this.state;

        let wordForms = words.map((word, i) => {
            return (
                <ListGroup.Item>
                    <Form key={`word-${i}`}>
                        <Form.Row className='mt-1'>
                            <Col>
                                <WordSearch 
                                    onSelect={selectedWord => {
                                        let words = this.state.words.slice();
                                        words[i].wordId = selectedWord._id;
                                        this.setState({ words });
                                    }} 
                                />
                            </Col>
                        </Form.Row>

                        <Form.Row className='mt-1'>
                            <Col>
                                <InputGroup>
                                    <InputGroup.Prepend>
                                        <Button 
                                            variant={selectingIdx == i && selectingMode == 'paiute' ? 'primary' : 'outline-primary'} 
                                            onClick={e => this.setState({ selectingIdx: i, selectingMode: 'paiute' })}
                                            block 
                                        >
                                            Select Paiute
                                        </Button>
                                    </InputGroup.Prepend>
                                    <FormControl value={word.paiute} placeholder='Select Paiute' />
                                </InputGroup>
                            </Col>
                        </Form.Row>

                        <Form.Row className='mt-1'>
                            <Col>
                                <InputGroup>
                                    <InputGroup.Prepend>
                                        <Button 
                                            variant={selectingIdx == i && selectingMode == 'english' ? 'primary' : 'outline-primary'} 
                                            onClick={e => this.setState({ selectingIdx: i, selectingMode: 'english' })}
                                            block 
                                        >
                                            Select English
                                        </Button>
                                    </InputGroup.Prepend>
                                    <FormControl value={word.english} placeholder='Select English' />
                                </InputGroup>
                            </Col>
                        </Form.Row>

                        <Form.Row className='mt-1'>
                            <Col>
                                <Button block variant='outline-danger' onClick={e => {
                                    let words = this.state.words.slice();
                                    words.splice(i);
                                    this.setState({ words });
                                }}>
                                    <FontAwesomeIcon icon={faTrash} className='mr-2' />
                                    Delete
                                </Button>
                            </Col>
                        </Form.Row>

                    </Form>
                </ListGroup.Item>
            );
        });

        let wordFormsList;
        if (wordForms.length > 0) {
            wordFormsList = (
                <ListGroup variant='flush'>
                    {wordForms}
                </ListGroup>
            );
        }
        
        return (
            <Row>
                <Col>
                    <Button 
                        variant='outline-primary' 
                        block
                        onClick={e => {
                            let words = this.state.words.slice();
                            words.push({ paiuteRange: null, englishRange: null, wordId: null, english: '', paiute: ''});
                            this.setState({ words });
                        }}
                    >
                        <FontAwesomeIcon icon={faPlus} className='mr-2' />
                        Word
                    </Button>
                    {wordFormsList}
                </Col>
            </Row>
        );
    }

    getForm() {
        let { english, paiute, audio, image, selectingIdx, selectingMode } = this.state;
        let sentence = this.props.sentence || {};

        let approveButton;
        if (sentence.wordId != null) {
            approveButton = (
                <Button 
                    variant={sentence.suggested ? "outline-info" : "outline-warning"} href='#'
                    className='w-100'
                    onClick={e => this.toggleApprove()}
                >
                    <FontAwesomeIcon icon={sentence.suggested ? faCheck : faTimes} className='mr-2' />
                    {sentence.suggested ? "Approve" : "Un-approve"}
                </Button>
            );
        }

        let deleteButton;
        if (sentence._id != null) { // sentence exists
            deleteButton = (
                <Button 
                    variant='outline-danger' href='#'
                    className='w-100'
                    onClick={e => {
                        if (window.confirm('Are you sure you want to delete this sentence?')) {
                            this.delete()
                        }
                    }}
                >
                    <FontAwesomeIcon icon={faTrash} className='mr-2' />
                    Delete
                </Button>
            );
        }

        let hasChanged = this.hasChanged();
        return (
            <Form>
                <Form.Group controlId={`form-sentence-paiute-${sentence._id || "new"}`}>
                    <Form.Label>Paiute</Form.Label>
                    <Form.Control as="textarea" value={paiute} 
                        onSelectCapture={e => {
                            let [start, end] = [e.target.selectionStart, e.target.selectionEnd];
                            if (end - start > 0 && selectingIdx != null && selectingMode == 'paiute') {
                                let { words } = this.state;

                                words[selectingIdx].paiute = e.target.value.slice(start, end);
                                words[selectingIdx].paiuteRange = [start, end];
                                this.setState({ words: words, selectingIdx: null, selectingMode: null });
                            }
                        }}
                        onChange={e => this.setState({ paiute: replaceSpecialChars(e.target.value) })}
                    />
                </Form.Group>

                <Form.Group controlId={`form-sentence-english-${sentence._id || "new"}`}>
                    <Form.Label>English</Form.Label>
                    <Form.Control as="textarea" value={english} 
                        onSelectCapture={e => {
                            let [start, end] = [e.target.selectionStart, e.target.selectionEnd];
                            if (end - start > 0 && selectingIdx != null && selectingMode == 'english') {
                                let { words } = this.state;

                                words[selectingIdx].english = e.target.value.slice(start, end);
                                words[selectingIdx].englishRange = [start, end];
                                this.setState({ words: words, selectingIdx: null, selectingMode: null });
                            }
                        }}
                        onChange={e => this.setState({english: e.target.value})}
                    />
                </Form.Group>
                
                <AudioInput 
                    key={sentence._id}
                    audio={audio}
                    onSave={audio => this.setState({ audio })}
                />

                <ImageInput
                    key={sentence._id}
                    image={image}
                    onSave={image => this.setState({ image })}
                />

                <ButtonGroup className='d-flex' id={`form-sentence-buttons-${sentence._id || "new"}`}>
                    <Button 
                        variant={hasChanged ? 'outline-success' : 'outline-secondary'} 
                        href='#'
                        className='w-100'
                        disabled={!hasChanged}
                        onClick={e => this.save()}
                    >
                        {sentence._id == null ? "Submit" : "Save"}
                    </Button>
                    {approveButton}
                    {deleteButton}
                </ButtonGroup>
                

            </Form>
        );
    }

    render() {
        return (
            <Row className="mt-3">
                <Col xs={12} md={6}>
                    {this.getForm()}
                </Col>
                <Col xs={12} md={6}>
                    {this.annotateForm()}
                </Col>
            </Row>
        );
    }
};


export default SentenceForm;