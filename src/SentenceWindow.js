import React from 'react';
import { Spinner, Row, Col, Button, Image, Popover, OverlayTrigger } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import api from './Api';
import history from './history';
import SearchBar from './SearchBar';

import { getPosLabel, getdefault, setdefault } from './helpers';

import './common.css';

class SentenceWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sentence: this.props.sentence || null,
            tokenMap: {},
            reverseTokenMap: {},
        };

        if (this.props.sentence != null) {
            this.state.sentence = this.props.sentence;
        }
    }

    getSentence() {
        let { sentence, sentenceId } = this.props;
        if (sentence == null) {
            api.get(`/api/sentences/${sentenceId}`).then(res => {
                if (res.status == 200 && res.data.success) {
                    let reverseTokenMap = {};
                    let tokenMap = {};
                    if (res.data.result.paiuteTokens != null) {
                        res.data.result.paiuteTokens.forEach((token, i)=> {
                            tokenMap[i] = token.token_map || [];
                            tokenMap[i].forEach(j => {
                                setdefault(reverseTokenMap, j, []);
                                reverseTokenMap[j].push(i);
                            })
                        })
                    }
                    this.setState({ tokenMap, reverseTokenMap, sentence: res.data.result });
                } else {
                    console.log(res.status, res.data);
                    this.setState({ sentence: false });
                }
            }).catch(err => {
                console.error(err);
                this.setState({ sentence: false });
            });
        }
    }
 
    componentDidMount() {
        this.getSentence();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.sentenceId !== prevProps.sentenceId) { 
            this.getSentence();
        }
    }

    /**
     * 
     * @param {String} lang 
     * @param {Array} tokens 
     */
    getSentenceTokens(lang, tokens) {
        let { hoverLang, hoverToken, tokenMap, reverseTokenMap } = this.state;

        return tokens.map((token, i) => {
            if (token.token_type == 'word') {
                let isHovering = hoverLang == lang && hoverToken == i;
                let isRelatedHovering = false;
                if (hoverLang != lang && hoverToken != null) {
                    isRelatedHovering = getdefault(lang == 'english' ? tokenMap : reverseTokenMap, hoverToken, []).includes(i);
                }

                let tokenSpan = (
                    <span
                        key={`span-token-${lang}-${i}`}
                        className={(isHovering || isRelatedHovering) ? 'bg-info' : ''}
                        onMouseEnter={() => {
                            this.setState({hoverLang: lang, hoverToken: i});
                        }}
                        onMouseLeave={() => {
                            if (isHovering) {
                                this.setState({ hoverLang: null, hoverToken: null });
                            }
                        }}
                        style={{fontSize: '20px', cursor: 'pointer'}}
                        
                        onClick={e => {
                            if (token.word != null && token.word.text != null) {
                                history.push(`/words/${token.word._id}`)
                            }
                        }}
                    >
                        {token.text}
                    </span>
                );
                if (token.word != null && token.word.text != null) {
                    tokenSpan = (
                        <OverlayTrigger
                            key={`overlay-token-paiute-${i}`}
                            trigger='hover'
                            placement='bottom'
                            overlay={
                                <Popover id={`popover-${lang}-${i}`} show={false}>
                                    <Popover.Title as="h4">
                                        {token.word.text}
                                        <span className='float-right'> <em>({getPosLabel(token.word.part_of_speech)})</em></span>
                                    </Popover.Title>
                                    <Popover.Content>
                                        {token.word.definition}
                                    </Popover.Content>
                                </Popover>
                            }
                        >
                            {tokenSpan}
                        </OverlayTrigger>
                    );
                }
                return tokenSpan;
            } else {
                return <span style={{fontSize: '20px'}} key={`span-token-${lang}-${i}`}>{token.text}</span>;
            }
        });
    }

    getSentencePanel() {
        let { sentence } = this.state;
        if (sentence.paiuteTokens.length <= 0 || sentence.englishTokens.length <= 0) {
            return (
                <Row>
                    <Col style={{borderRight: '1px solid gray'}} className='text-right'>
                        <span 
                            key={'sentence-paiute'}
                            style={{fontSize: '20px'}}
                        >
                            <h4>Paiute</h4>
                            <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                            {sentence.paiute}
                        </span>
                    </Col>
                    <Col>
                        <span 
                            key={'sentence-english'}
                            style={{fontSize: '20px'}}
                        >
                            <h4>English</h4>
                            <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                            {sentence.english}
                        </span>
                    </Col>                
                </Row>
            );
        }

        return (
            <Row>
                <Col style={{borderRight: '1px solid gray'}} className='text-right'>
                    {this.getSentenceTokens('paiute', sentence.paiuteTokens)}
                </Col>
                <Col>
                    {this.getSentenceTokens('english', sentence.englishTokens)}
                </Col>                
            </Row>
        );
        
        return [
        ]
    }

    render() {
        let { sentence } = this.state;
        let { canEdit } = this.props;
        if (sentence == null) return <Spinner />;
        else if (sentence == false) return <h4>We can't find the sentence you're looking for.</h4>;

        let audioPlayer;
        if (sentence.audio != null && sentence.audio.data != null) {
            audioPlayer = (
                <Row>
                    <Col>
                        <audio src={sentence.audio.data} controls />
                    </Col>
                </Row>
            );
        }

        let editButton;
        if (canEdit) {
            editButton = (
                <Row className='mb-2'>
                    <Col>
                        <Button 
                            variant='outline-primary'
                            onClick={e => history.push(`/sentences/${sentence._id}?mode=edit`)}
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
        if (sentence.image != null && sentence.image.data != null) {
            imageSquare = <Image src={sentence.image.data} rounded style={{width: '100%'}} />;
        }

        let notesSquare;
        if (sentence.notes) {
            notesSquare = (
                <Col>
                    <h4>Notes</h4>
                    <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />
                    <p>{sentence.notes}</p>
                </Col>
            );
        }

        let rows = [
            <Row className="mt-2">
                <Col>
                    <SearchBar showRandomButtons />
                </Col>
            </Row>
        ]
        if (!imageSquare) {
            rows.push(
                <Row className='mt-3'>
                    <Col>
                        {editButton}
                        {this.getSentencePanel()}
                        {audioPlayer}
                        {notesSquare}
                    </Col>
                </Row>
            );
        } else {
            rows.push(
                <Row className='mt-3'>
                    <Col>
                        {this.getSentencePanel()}
                        {audioPlayer}
                        {notesSquare}
                    </Col>
                    <Col>
                        {editButton}
                        {imageSquare}
                    </Col>
                </Row>
            );
        }

        return rows;
    }
};

export default SentenceWindow;