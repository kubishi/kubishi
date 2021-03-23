
import { faAngleLeft, faPrint, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Col, Row } from 'react-bootstrap';

import api from '../Api';
import { generateLayout } from 'crossword-layout-generator';
import Crossword from '@jaredreisinger/react-crossword';
import React from 'react';

import PrintProvider, { Print, NoPrint } from 'react-easy-print';
import "./WordListCrossword.css";


class WordListCrossword extends React.Component {
    constructor(props) {
        super(props);
        this.crossword = React.createRef();
        this.state = {
            crosswordData: {
                across: {},
                down: {}
            }
        }
    }

    componentDidMount() {
        this.getWordList();
    }

    getWordList() {
        api.get(`/api/wordlist/${this.props.wordlistId}`).then(res => {
            if (res.status == 200) {
                this.generateCrossword(res.data.result);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    generateCrossword(wordlist) {
        if (wordlist == null || (wordlist.words || []).length <= 0) {
            return;
        }

        let layout = generateLayout(wordlist.words.map(word => { 
            return {
                clue: word.definition, 
                answer: word.text.replace("w̃", "w").replace("W̃", "W").replace(/^[^a-z'\d]*|[^a-z'\d]*$/gi, '')
            }; 
        }));

        let data = {
            across: {},
            down: {}
        };
        layout.result.forEach((elem, i) => {
            data[elem.orientation][i] = {
                clue: elem.clue,
                answer: elem.answer,
                row: elem.starty,
                col: elem.startx
            }
        });
        this.setState({crosswordData: data}, () => this.crossword.current.reset());
    }

    render() {
        let { crosswordData } = this.state;

        let isHidden = crosswordData.across.length <= 0 && crosswordData.down.length <= 0;
        return (
            <PrintProvider>
                <NoPrint>
                    <Row className="mt-2">
                        <Col className="pr-md-1">
                            <Button 
                                variant='outline-primary'
                                href={`/wordlist/${this.props.wordlistId}`}
                                block
                            >
                                <FontAwesomeIcon icon={faAngleLeft} className='mr-2' />
                                Back to List
                            </Button>
                        </Col>
                        <Col className="pl-md-1 pr-md-1">
                            <Button 
                                variant='outline-primary'
                                block
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className='mr-2' />
                                Print
                            </Button>
                        </Col>
                    </Row>
                </NoPrint>
                <Print>
                    <Row className="mt-2" ref={el => (this.printRef = el)} >
                        <Col style={{visibility: isHidden ? "hidden" : ""}}>
                            <Crossword data={crosswordData} ref={this.crossword} />
                        </Col>
                    </Row>
                </Print>
            </PrintProvider>
        );
    }
};

export default WordListCrossword;