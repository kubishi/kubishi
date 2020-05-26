
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, Spinner } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

import PartOfSpeech from './PartOfSpeech';
import WordForm from './WordForm';
import SentenceForm from './SentenceForm';

import Select from 'react-select';

import { remove_punctuation, toBase64 } from './helpers';
import api from './Api';
import history from './history';
import './common.css';

class WordWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            word: null,
            sentences: []
        };
    }

    componentDidMount() {
        this.getWord();
    }

    getWord() {
        api.get('/api/word/' + this.props.wordId).then(res => {
            if (res.status == 200) {
                let word = res.data.result;
                let sentences = [];
                res.data.result.sentences.forEach(sentence => {
                    sentence.suggested = false;
                    sentence.wordId = word._id;
                    sentences.push(sentence);
                });
                this.getSuggestedSentences(word, sentences);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
            this.setState({word: false});
        });
    }
   
    addSentence() {
        let { word } = this.state;

        api.post('/api/sentence',
            {english: "", paiute: ""}
        ).then(res => {
            if (res.status == 200 && res.data.success) {
                api.post(`/api/word/${word._id}/sentence`, 
                    {sentence: res.data.result._id}
                ).then(res => {
                    if (res.status == 200 && res.data.success) {
                        this.getWord();
                    } else {
                        console.log(res.status, res.data);
                    }
                }).catch(err => console.error(err));
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));

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
                searchFields: ['text'],
                mode: 'fuzzy',
            }
        }).then(res => {
            if (res.status == 200) {
                if (res.data.result) {
                    res.data.result.forEach(sentence => {
                        if (sentences[sentence._id] == null) {
                            sentence.suggested = true;
                            sentence.wordId = word._id;
                            sentences.push(sentence);
                        }
                    });
                }
            } else {
                console.log(res.status, res.data);
            }
            this.setState({ word, sentences });
        }).catch(err => console.error(err));
    }
    
    saveWord(word) { 
        console.log(this.props.wordId, word);
        api.put('/api/word/' + this.props.wordId, word).then(res => {
            if (res.status == 200) {
                this.getWord()
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    removeSentence(sentenceId) {
        let { word } = this.state;
        if (word == null) return; // word not loaded yet

        api.delete(`/api/word/${word._id}/sentence/${sentenceId}`).then(res => {
            if (res.status == 200) {
                this.getWord()
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    deleteWord() {
        let { word } = this.state;
        if (word == null) return; // word not loaded yet

        api.delete(`/api/word/${word._id}`).then(res => {
            if (res.status == 200) {
                return history.push('/');
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { word, sentences } = this.state;

        if (word == null) {
            return <Spinner />;
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
                    <SentenceForm 
                        sentence={sentence} 
                        postSave={e => this.getWord()} postApprove={e => this.getWord()} 
                        postDelete={e => this.removeSentence(sentence._id)}
                    />
                </ListGroup.Item>
            );
            if (sentence.suggested == true) {
                suggSentences.push(listItem);
            } else {
                regSentences.push(listItem);
            }
        });
        
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
        
        return (
            <Row className='m-3'>
                <Col xs={12} md={4}>
                    <Button variant='outline-primary' block className='mb-2' onClick={e => {
                        return history.push(`/word/${word._id}`);
                    }}>
                        Back to Word
                    </Button>
                    <WordForm 
                        word={word} 
                        submitText="Save"
                        onSubmit={word => this.saveWord(word)} 
                        onDelete={e => this.deleteWord()} 
                    />
                </Col>
                <Col xs={12} md={8}>
                    {sentencesList}
                    {suggSentencesList}
                </Col>
            </Row>
        );
    }
}

export default WordWindow;