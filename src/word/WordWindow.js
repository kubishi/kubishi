
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Image, Row, Spinner } from 'react-bootstrap';
import api from '../Api';
import '../common/common.css';
import SearchBar from '../search/SearchBar';
import SentenceList from '../sentence/SentenceList';
import ShareButtons from '../common/ShareButtons';
import WordList from './WordList';
import qs from 'query-string';


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
            audioPlayer = (
                <div style={{margin: '0 auto', display: 'table'}}>
                    <audio src={word.audio.data} controls />
                </div>
            );
        }
        
        let quote = `Check out this word in nanüümüyadohana!\n${word.text}: ${word.definition}`;
        let shareButtons = (
            <Row>
                <Col>
                    <ShareButtons title={word.text} quote={quote} url={`https://kubishi.com/words/${word._id}`} />
                </Col>
            </Row>
        );
        
        
        let tagsList;
        if (word.tags != null && word.tags.length > 0) {
            let tagsListItems = word.tags.map((tag, i) => {
                return (
                    <a key={`tag-${i}`} href={`/search?${qs.stringify({tags: tag})}`}>
                        {tag}
                    </a>
                );
            }).reduce((acc, x) => {
                return acc === null ? x: <>{acc}, {x} </>;
            })
            tagsList = (
                <>
                    <h4 className='mt-2'>Tags</h4>
                    <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                    <p>{tagsListItems}</p>
                </>
            );
        }

        return (
            <>
                <Row className="mt-2">
                    <Col>
                        <SearchBar showRandomButtons />
                    </Col>
                </Row>
                <Row>
                    <Col sm={12} lg={4} className='lg-border-right mt-2'>
                        {editButton}
                                            
                        <h3>{word.text}</h3>
                        <p><em>{word.part_of_speech || 'unknown'}</em></p>
                        <p>{word.definition}</p>
                        {audioPlayer}
                        
                        {imageSquare}

                        {notesArea}
                        {relatedWordsList}
                        
                        {tagsList}
                        {shareButtons}
                    </Col>
                    <Col sm={12} lg={8} className='mt-2'>
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