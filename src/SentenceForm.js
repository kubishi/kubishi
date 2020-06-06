
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, InputGroup, FormControl } from 'react-bootstrap';
import Select from 'react-select';
import lodash from 'lodash';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faAngleRight, faAngleLeft, faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';

import api from './Api';
import AudioInput from './AudioInput';
import ImageInput from './ImageInput';
import { getUpdates, replaceSpecialChars, getPosLabel } from './helpers';

import './SentenceForm.css';


function setdefault(obj, key, value) {
    if (!obj.hasOwnProperty(key)) {
        obj[key] = value;
    }
    return obj[key];
}

function getdefault(obj, key, value = null) {
    if (obj.hasOwnProperty(key)) {
        return obj[key];
    }
    return value;
}

let REGEX = /([0-9a-zA-Zw̃W̃üÜ']+)([^\s]?\s?)?/g;

class SentenceForm extends React.Component {
    constructor(props) {
        super(props);
    
        let sentence = this.props.sentence || {};
        this.state = {
            english: sentence.english || null,
            paiute: sentence.paiute || null,
            image: sentence.image || {filename: null, data: null},
            audio: sentence.audio || {filename: null, data: null},
            notes: sentence.notes || null,

            editingText: sentence.paiuteTokens == null,
            selectedButton: null,
            defaultQuery: null,
            selected: null,
            query: null,
            options: [],

            paiuteTokens: (!sentence.paiuteTokens || sentence.paiuteTokens.length <= 0) ? this.parseSentence(sentence.paiute || '') : sentence.paiuteTokens,
            englishTokens: (!sentence.englishTokens || sentence.englishTokens.length <= 0) ? this.parseSentence(sentence.english || '') : sentence.englishTokens,
    
            tokenMap: {}
        };
        
        if (sentence.tokenMap != null) {
            Object.entries(sentence.tokenMap).forEach(([key, value]) => {
                this.state.tokenMap[key] = new Set(value || []);
            });
        }
    }

    /**
     * 
     * @param {String} text 
     * @returns 
     */
    parseSentence(text) {
        let tokens = [];
        let match = REGEX.exec(text);
        while (match) {
          tokens.push({token_type: 'word', text: match[1], word: null});
          tokens.push({token_type: 'punc', text: match[2] || null});
          match = REGEX.exec(text);
        }
        return tokens;
    }
  
    /**
     * 
     * @param {React.ChangeEvent} e 
     */
    handlePaiuteChange(e) {
        let [paiute, newStart]= replaceSpecialChars(e.target.value, e.target.selectionStart);
        let paiuteTokens = this.parseSentence(paiute);
        this.setState(
            { paiuteTokens, paiute, paiuteSelectStart: newStart }, 
            () => this.refs.paiuteInput.setSelectionRange(newStart, newStart)
        );
    }
  
    /**
     * 
     * @param {React.ChangeEvent} e 
     */
    handleEnglishChange(e) {
        let englishTokens = this.parseSentence(e.target.value);
        this.setState({ englishTokens, english: e.target.value });
    }

    getWordLabel(word) { 
        if (word == null) return '';
        return `${word.text} (${getPosLabel(word.part_of_speech)}): ${word.definition}`;
    }

    getWordOption(word) { 
        if (word == null) return null;
        return {
            label: `${word.text} (${getPosLabel(word.part_of_speech)}): ${word.definition}`,
            value: word
        };
    }
    
    updateSearchQuery() {
        let query = this.state.query || this.state.defaultQuery;
        if (query == null || query == '') return; // empty query
        query = replaceSpecialChars(query);
        api.get('/api/search/words', 
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
                let options = res.data.result.map(word => this.getWordOption(word));
                this.setState({ options });
            } else {
                console.log(res.status, res.data);
                this.setState({ options: [] });
            }
        }).catch(err => console.error(err));
    }

    getWordSearch() {
        let { options, query, selected } = this.state;

        return (
            <Select 
                placeholder='Search for word...'
                isClearable={true}
                options={options}
                inputValue={query || ''}
                value={selected}
                onChange={selected => {
                    let { paiuteTokens, selectedButton } = this.state;
                    paiuteTokens[selectedButton].word = selected == null ? null : selected.value;
                    this.setState({ paiuteTokens, selected });
                }}
                onInputChange={query => this.setState({ query }, () => this.updateSearchQuery()) }
            />
        );
    }
  
    render() {
        let {
            editingText,
            image, audio, notes,
            english, paiute,
            paiuteTokens,
            englishTokens,
            selectedButton,
            tokenMap
        } = this.state;

        let sentence = this.props.sentence || {};
  
        let paiuteButtons = paiuteTokens.map((token, i) => {
            if (token.token_type == 'word') {
                return (
                    <Button
                        key={`token-paiute-${i}`}
                        variant={selectedButton === i ? "primary" : "outline-primary"}
                        onClick={e => this.setState(
                                { 
                                    selectedButton: i, 
                                    defaultQuery: paiuteTokens[i].text, 
                                    query: '', 
                                    selected: this.getWordOption(paiuteTokens[i].word)
                                }, 
                                () => this.updateSearchQuery()
                            )
                        }
                    >
                        {token.text}
                    </Button>
                );
            } else {
                return token.text;
            }
        });
        
        let englishButtons = englishTokens.map((token, i) => {
            if (token.token_type == 'word') {
                return (
                    <Button
                        key={`token-english-${i}`}
                        variant={(getdefault(tokenMap, selectedButton) || new Set()).has(i) ? "secondary" : "outline-primary"}
                        onClick={e => {
                            if (selectedButton == null) return;
                            setdefault(tokenMap, selectedButton, new Set());
                            if (!tokenMap[selectedButton].has(i)) {
                                tokenMap[selectedButton].add(i);
                            } else {
                                tokenMap[selectedButton].delete(i);
                            }
                            this.setState({ tokenMap });
                        }}
                    >
                        {token.text}
                    </Button>
                );
            } else {
                return token.text;
            }
        });
        
        if (englishButtons.length <= 0) {
            englishButtons = 'English words go here'.split(' ').map(word => [
                <Button key='english-label-btn' variant='secondary' href='#' disabled >{word}</Button>, 
                ' '
            ]);
        }
        if (paiuteButtons.length <= 0) {
            paiuteButtons = 'Paiute words go here'.split(' ').map(word => [
                <Button key='paiute-label-btn' variant='secondary' href='#' disabled>{word}</Button>, 
                ' '
            ]);
        }

        let wordSearch = this.getWordSearch();
        let wordTokenForm = [
            <Row className='mt-2'>
                <Col xs={12} md={6}>
                    <Row className="mb-2">
                        <Col className='text-center'>
                            {paiuteButtons}
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>
                            {wordSearch}
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col className='text-center'>
                            {englishButtons}
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Form>
                        <Form.Group>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={notes}
                                onChange={e => this.setState({ notes: e.target.value })}
                            />
                        </Form.Group>

                        <AudioInput 
                            key={`audio-input-${sentence._id || "new"}`}
                            audio={audio}
                            onSave={audio => this.setState({ audio })}
                        />

                        <ImageInput
                            key={`image-input-${sentence._id || "new"}`}
                            image={image}
                            onSave={image => this.setState({ image })}
                        />
                    </Form>
                </Col>
            </Row>,
            <Row>
                <Col>
                    <Button 
                        block 
                        variant='outline-primary'
                        onClick={e =>{
                            if (window.confirm('Are you sure you want to go back to editing sentence text? If you do, all current word mappings will be lost.')) {
                                this.setState({ editingText: true, tokenMap: {}, paiuteTokens: [], englishTokens: [], selectedButton: null });
                            }
                        }}
                    >
                        <FontAwesomeIcon icon={faAngleLeft} className='mr-2' />
                        Edit Sentence Text
                    </Button>
                </Col>
                <Col>
                    <Button 
                        block
                        onClick={e => this.props.onSave(this.state)} variant='outline-primary'
                    >
                        Save
                    </Button>
                </Col>
            </Row>
        ];

        let wordTextForm = (
            <Form className='mt-2'>
                <Form.Group>
                    <Form.Label>Paiute</Form.Label>
                    <Form.Control
                        type="text"
                        ref="paiuteInput"
                        placeholder="Paiute"
                        aria-label="Paiute"
                        aria-describedby="basic-addon1"
                        value={paiute}
                        onChange={e => this.handlePaiuteChange(e)}
                    />
                </Form.Group>

                <Form.Group>
                    <Form.Label>English</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="English"
                        aria-label="English"
                        aria-describedby="basic-addon2"
                        value={english}
                        onChange={e => this.handleEnglishChange(e)}
                    />
                </Form.Group>  

                <Form.Group>
                    <Button
                        onClick={e => {
                            this.setState({ editingText: false, paiuteTokens: this.parseSentence(paiute), englishTokens: this.parseSentence(english) });
                        }}
                        disabled={!paiute || !english}
                        variant='outline-primary'
                        block href='#'
                    >
                        Next
                        <FontAwesomeIcon className='ml-2' icon={faAngleRight} />
                    </Button>
                </Form.Group>
            </Form>
        );

        return editingText ? wordTextForm : wordTokenForm;
  
    }
};

export default SentenceForm;