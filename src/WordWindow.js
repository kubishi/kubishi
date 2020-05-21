
import React from 'react';
import { Row, Col, ListGroup, Button, Spinner } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

import { remove_punctuation } from './helpers';
import api from './Api';
import history from './history';
import './common.css';

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
                mode: 'fuzzy',
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
            console.log('Setting state');
            this.setState({word, sentences});
        }).catch(err => console.error(err));
    }

    render() {
        let { word, sentences } = this.state;
        let { canEdit, wordId } = this.props;

        console.log('rendering', word == null, sentences == null);

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
                    <b>{sentence.paiute}</b>
                    <p>{sentence.english}</p>
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
        
        let relatedWords = word.words.map((word, i) => {
            return (
                <ListGroup.Item action href={'/word/' + word._id}>
                    <Row>
                        <Col className='text-right xs-border-right'>
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
            let listGroup = <ListGroup variant='flush'>{relatedWords}</ListGroup>;
            relatedWordsList = (
                <Row className='mt-3'>
                    <Col>
                        <h5 className='text-center'>See Also</h5>
                        {listGroup}
                    </Col>
                </Row>
            );
        }

        let editButton;
        if (canEdit) {
            editButton = (
                <Row className="mb-2">
                    <Col>
                        <Button 
                            variant='outline-primary'
                            onClick={e => {
                                history.push(`/word/${wordId}?mode=edit`);
                                return history.go();
                            }}
                            block
                        >
                            <FontAwesomeIcon icon={faEdit} className='mr-2' />
                            Edit
                        </Button>
                    </Col>
                </Row>
            );
        }
        
        let wordBody = (
            <Row>
                <Col sm={12} md={4} className='md-border-right'>
                    {editButton}
                    <Row>
                        <Col>
                            <h4>{word.text}</h4>
                            <p><em>{word.part_of_speech.toLowerCase().replace('_', ' ')}</em></p>
                            <p>{word.definition}</p>
                            {relatedWordsList}
                        </Col>
                    </Row>
                </Col>
                <Col sm={12} md={8} >
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