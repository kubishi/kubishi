
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import lodash from 'lodash';
import React from 'react';
import { Button, ButtonGroup, Col, Form, ListGroup, Row } from 'react-bootstrap';
import Select from 'react-select';
import api from './Api';
import AudioInput from './AudioInput';
import './common.css';
import { getPosLabel, getUpdates } from './helpers';
import ImageInput from './ImageInput';
import PartOfSpeech from './PartOfSpeech';


class WordForm extends React.Component {
    constructor(props) {
        super(props);

        let word = this.props.word || {};
        this.state = {
            text: word.text || null,
            part_of_speech: word.part_of_speech || null,
            definition: word.definition || null,
            notes: word.notes || null,
            audio: word.audio || {data: null, filename: null},
            image: word.image || {data: null, filename: null},
            words: word.words || [],
            related_options: [],
        };
    }

    submitWord() {
        let newWord = lodash.cloneDeep(lodash.pick(this.state, ['text', 'part_of_speech', 'definition', 'audio', 'image', 'words', 'notes']));
        newWord.words = newWord.words.map(word => word._id);
        this.props.onSubmit(newWord);
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
                    query: query, 
                    mode: 'fuzzy',
                    searchFields: ['text', 'definition']
                }
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({related_options: []});
            } else if (res.data.result.length <= 0) {
                this.setState({related_options: []});
            } else {
                let options = res.data.result.map(word => this.getWordOption(word));
                this.setState({ options });
                this.setState({related_options: options});
            }
        }).catch(err => console.error(err));
    }
     
    getWordOption(word) { 
        if (word == null) return null;
        return {
            label: `${word.text} (${getPosLabel(word.part_of_speech)}): ${word.definition}`,
            value: word
        };
    }

    hasChanged() {
        let newWord = lodash.cloneDeep(lodash.pick(this.state, ['text', 'part_of_speech', 'definition', 'audio', 'image', 'words', 'notes']));
        return Object.keys(getUpdates(this.props.word, newWord)).length > 0;
    }

    render() {
        let { submitText, deleteText, onDelete, word } = this.props;
        let { text, part_of_speech, definition, audio, image, words, notes } = this.state;

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
                                onChange={e => {this.setState({text: e.target.value})}}
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

                <Form.Group>
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                        as="textarea"
                        value={notes}
                        onChange={e => this.setState({ notes: e.target.value })}
                    />
                </Form.Group>
                {buttons}
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