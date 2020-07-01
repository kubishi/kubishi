
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Image, Row, Spinner } from 'react-bootstrap';
import api from './Api';
import './common.css';
import SearchBar from './SearchBar';
import SentenceList from './SentenceList';
import ShareButtons from './ShareButtons';
import WordList from './WordList';

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
        if ((word.words || []).length > 0) {
            relatedWordsList = (
                <Row>
                    <Col>
                        <h4 className='text-center'>See Also</h4>
                        <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                        <WordList results={word.words} />
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
                            href={`/words/${wordId}?mode=edit`}
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
        
        let quote = `Check out this word in nanüümüyadohana!\n${word.text}: ${word.definition}`;
        let shareButtons = (
            <Row>
                <Col>
                    <ShareButtons title={word.text} quote={quote} url={`https://kubishi.com/words/${word._id}`} />
                </Col>
            </Row>
        );
        return (
            <>
                <Row className="mt-2">
                    <Col>
                        <SearchBar showRandomButtons />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} md={4} className='md-border-right mt-2'>
                        {editButton}
                                            
                        <h3>{word.text}</h3>
                        <p><em>{(word.part_of_speech || 'UNKNOWN').toLowerCase().replace('_', ' ')}</em></p>
                        <p>{word.definition}</p>
                        {audioPlayer}
                        
                        {imageSquare}

                        {notesArea}
                        {relatedWordsList}
                        
                        {shareButtons}
                    </Col>
                    <Col sm={12} md={8} className='mt-2'>
                        <h4 className='text-center'>Sentences</h4>
                        <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                        <SentenceList results={sentences} />
                    </Col>
                </Row>
            </>
        );
    }
}

export default WordWindow;