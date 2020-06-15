
import React from 'react';
import { Row, Col, ListGroup, Button, Spinner, Image, InputGroup } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import api from './Api';
import SentenceList from './SentenceList';
import SearchBar from './SearchBar';
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

    componentDidUpdate(prevProps, prevState) {
        if (this.props.wordId !== prevProps.wordId) { 
            this.getWord();
            this.getSentences();        
        }
    }

    getWord() {
        api.get(`/api/words/${this.props.wordId}`).then(res => {
            if (res.status == 200) {
                this.setState({word: res.data.result});
            } else {
                console.log(res.status, res.data);
                this.setState({word: false});
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
                this.setState({sentences: []});
            }
        }).catch(err => {
            this.setState({sentences: []});
            console.error(err);
        });
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

        let notesArea;
        if (word.notes) {
            notesArea = (
                <Row>
                    <Col>
                        <h4 className='text-center'>Notes</h4>
                        <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                        <p>{word.notes}</p>
                    </Col>
                </Row>
            );
        }
        
        let relatedWordsList;
        if (relatedWords.length > 0) {
            let listGroup = <ListGroup variant='flush'>{relatedWords}</ListGroup>;
            relatedWordsList = (
                <Row>
                    <Col>
                        <h4 className='text-center'>See Also</h4>
                        <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
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
        
        let imageSquare;
        if (word.image != null && word.image.data != null) {
            imageSquare = <Image className='mb-3' src={word.image.data} rounded style={{width: '100%'}} />;
        }
        
        let audioPlayer;
        if (word.audio != null && word.audio.data != null) {
            audioPlayer = <audio src={word.audio.data} controls />;
        }
        
        return [
            <Row className="mt-2">
                <Col>
                    <SearchBar showRandomButtons />
                </Col>
            </Row>,
            <Row className='mt-2'>
                <Col sm={12} md={4} className='md-border-right mt-2'>
                    {editButton}
                    
                    <h3>{word.text}</h3>
                    <p><em>{(word.part_of_speech || 'UNKNOWN').toLowerCase().replace('_', ' ')}</em></p>
                    <p>{word.definition}</p>
                    {audioPlayer}
                    
                    {imageSquare}

                    {notesArea}
                    {relatedWordsList}
                </Col>
                <Col sm={12} md={8} className='mt-2'>
                    <h4 className='text-center'>Sentences</h4>
                    <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                    <SentenceList results={sentences} />
                </Col>
            </Row>
        ];
    }
}

export default WordWindow;