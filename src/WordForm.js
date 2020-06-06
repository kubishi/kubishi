
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, Spinner, InputGroup } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

import PartOfSpeech from './PartOfSpeech';
import Select from 'react-select';

import { remove_punctuation, toBase64, replaceSpecialChars } from './helpers';
import ImageInput from './ImageInput';
import AudioInput from './AudioInput';
import api from './Api';
import './common.css';

function arraysEqual(a, b) {
    // Source: https://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

class WordForm extends React.Component {
    constructor(props) {
        super(props);

        let word = this.props.word || {};
        this.state = {
            text: word.text || null,
            part_of_speech: word.part_of_speech || null,
            definition: word.definition || null,
            audio: word.audio || {data: null, filename: null},
            image: word.image || {data: null, filename: null},
            words: word.words || [],
            related_options: [],
        };
    }

    submitWord() {
        let { onSubmit } = this.props;
        let { text, part_of_speech, definition, audio, image, words } = this.state;
        words = words.map(word => word._id);
        onSubmit({text, part_of_speech, definition, audio, image, words });
    }

    deleteWord() {
        if (this.props.onDelete != null && window.confirm('Are you sure you want to delete this word?')) {
            this.props.onDelete();
        }
    }

    addRelatedWord(word) {
        let words = this.state.words.slice();
        if (!words.map(word => word._id).includes(word._id)) {
            words.push(word);
        }
        this.setState({ words });
    }

    removeRelatedWord(word) {
        let words = this.state.words.slice().filter(w => w._id != word._id);
        this.setState({ words });
    }

    updateRelatedOptions(query) {
        if (!query) return;
        api.get('/api/search/words', 
            {
                params: { 
                    query: query + '.*', 
                    mode: 'regex',
                    searchFields: ['text']
                }
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({related_options: []});
            } else if (res.data.result.length <= 0) {
                this.setState({related_options: []});
            } else {
                let options = res.data.result.map((word, i) => {
                    return {value: word, label: word.text};
                });
                this.setState({related_options: options});
            }
        }).catch(err => console.error(err));
    }

    hasChanged() {
        let { text, part_of_speech, definition, image, audio, words } = this.state;
        let word = this.props.word || {};

        return (
            word.text != text || 
            word.part_of_speech != part_of_speech || 
            word.definition != definition || 

            (word.image || {}).filename != (image || {}).filename || 
            (word.image || {}).data != (image || {}).data || 

            (word.audio || {}).filename != (audio || {}).filename || 
            (word.audio || {}).data != (audio || {}).data || 

            !arraysEqual(words, word.words)
        );
    }

    render() {
        let { submitText, deleteText, onDelete, word } = this.props;
        let { text, part_of_speech, definition, audio, image, words } = this.state;

        let part_of_speech_option = 'unknown';
        if (part_of_speech != null) {
            part_of_speech_option = part_of_speech.toLowerCase().replace('_', ' ');
        }
        let posOptions = PartOfSpeech.map((part_of_speech, i) => {
            let pos = part_of_speech.toLowerCase().replace('_', ' ');
            return (
                <option key={'option-pos-' + i}>{pos}</option>
            );
        });
        

        let saveDisabled = false;
        if (word != null) {
            saveDisabled = !this.hasChanged();
        }


        let buttons;
        if (onDelete != null) {
            buttons = (
                <Row className="mt-3 mb-2 no-gutter">
                    <Col>
                        <ButtonGroup className='d-flex' id={`form-word-buttons-${word._id || "new"}`}>
                            <Button onClick={e => this.deleteWord()} variant="outline-danger" className='w-100'>    
                                <FontAwesomeIcon icon={faTrash} className='mr-2' />
                                {deleteText}
                            </Button>
                            <Button 
                                className='w-100' 
                                href='#'
                                variant="outline-success" 
                                disabled={saveDisabled}
                                onClick={e => this.submitWord()} 
                            >
                                    {submitText}
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            );
        } else {
            buttons = (
                <Row className="mt-3 mb-2">
                    <Col>
                        <Button 
                            variant='outline-success'
                            onClick={e => this.submitWord()} 
                            href='#' 
                            disabled={saveDisabled} 
                            block
                        >
                            {submitText}
                        </Button>
                    </Col>
                </Row>
            );
        }

        let wordList = words.map((rWord, i) => {
            return (
                <ListGroup.Item>
                    <Button className='mr-2' variant='outline-danger' onClick={e => this.removeRelatedWord(rWord)} >
                        <FontAwesomeIcon icon={faTrash} />
                    </Button>
                    {rWord.text} <em>({rWord.part_of_speech.toLowerCase().replace('_', ' ')})</em>
                </ListGroup.Item>
            );
        });

        let form = (
            <Form>
                <Form.Row>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formWord'>
                            <Form.Label>Word</Form.Label>
                            <Form.Control 
                                type='text' value={text}
                                onChange={e => {this.setState({text: replaceSpecialChars(e.target.value)})}}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formPOS'>
                            <Form.Label>Part of Speech</Form.Label>
                            <Form.Control 
                                as="select" 
                                defaultValue={part_of_speech_option} 
                                onChange={e => {this.setState({part_of_speech: e.target.value})}}
                            >
                                {posOptions}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Form.Row>
                
                <Form.Row>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formDefinition'>
                            <Form.Label>Definition</Form.Label>
                            <Form.Control as="textarea" defaultValue={definition} 
                                onChange={e => this.setState({definition: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <ImageInput 
                            image={image}
                            onSave={image => this.setState({image})}
                        />
                    </Col>
                </Form.Row>
                
                <Form.Row>
                    <Col xs={12} md={6}>
                        <AudioInput 
                            audio={audio}
                            onSave={audio => this.setState({audio})}
                        />
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group>
                            <Form.Label>Related Words</Form.Label>
                            <Select 
                                placeholder='Add Related Word...'
                                options={this.state.related_options}
                                onChange={selected => this.addRelatedWord(selected.value)}
                                onInputChange={query => this.updateRelatedOptions(query)}
                            />
                            <ListGroup variant='flush'>
                                {wordList}
                            </ListGroup>
                        </Form.Group>
                    </Col>
                </Form.Row>

                <Form.Row>
                    <Col>
                        {buttons}
                    </Col>
                </Form.Row>
            </Form>
        );

        return form;
    }
};

WordForm.defaultProps = {
    submitText: 'Submit',
    deleteText: 'Delete',
};

export default WordForm;