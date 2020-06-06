
import React from 'react';
import { Row, Col, ListGroup, Button, Spinner } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { remove_punctuation } from './helpers';
import api from './Api';
import SentenceList from './SentenceList';
import history from './history';
import './common.css';

class WordWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            word: null,
            sentences: [],
        };
    }

    componentDidMount() {
        this.getWord();
        this.getSentences();
    }

    getWord() {
        api.get(`/api/words/${this.props.wordId}`).then(res => {
            if (res.status == 200) {
                this.setState({word: res.data.result});
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
            this.setState({word: false});
        });
    }

    getSentences() {
        api.get(`/api/words/${this.props.wordId}/sentences`).then(res => {
            if (res.status == 200) {
                this.setState({sentences: res.data.result});
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }
   
    render() {
        let { word, sentences } = this.state;
        let { canEdit, wordId } = this.props;

        if (word == null) {
            return <Spinner />;
        } else if (word == false) {
            return (
                <div className='mt-3 text-center'>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        let relatedWords = word.words.map((word, i) => {
            return (
                <ListGroup.Item action href={'/words/' + word._id}>
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
                                return history.push(`/words/${wordId}?mode=edit`);
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
                <Col sm={12} md={8}>
                    <h5 className='text-center'>Sentences</h5>
                    <SentenceList results={sentences} />
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