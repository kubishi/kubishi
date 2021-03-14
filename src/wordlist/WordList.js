
import { faEdit, faBorderAll, faPrint } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Image, Row, Spinner } from 'react-bootstrap';
import api from '../Api';
import '../common/common.css';
import WordList from '../word/WordList';
import { ListGroup } from 'react-bootstrap';

import PrintProvider, { Print, NoPrint } from 'react-easy-print';

class WordListWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wordlist: null,
        };
    }
 
    componentDidMount() {
        this.getWordList();
    }

    componentDidUpdate(prevProps, prevState) {
    }

    getWordList() {
        api.get(`/api/wordlist/${this.props.wordlistId}`).then(res => {
            if (res.status == 200) {
                this.setState({wordlist: res.data.result});
            } else {
                console.log(res.status, res.data);
                this.setState({wordlist: false});
            }
        }).catch(err => {
            console.error(err);
            this.setState({wordlist: false});
        });
    }
   
    render() {
        let { wordlist } = this.state;

        if (wordlist == null) {
            return <></>;
        }

        let words = wordlist.words || [];
        let list;
        if (words.length <= 0) {
            list = <h5>This list doesn't have any words yet!</h5>;
        } else {
            list = <WordList results={words} />
        }

        let editButton;
        let user = this.props.getUser();
        if (wordlist.user == user._id) { 
            editButton = (
                <Button 
                    variant='outline-primary'
                    href={`/wordlist/${this.props.wordlistId}?mode=edit`}
                    block
                >
                    <FontAwesomeIcon icon={faEdit} className='mr-2' />
                    Edit
                </Button>
            );
        }

        let printListItems = words.map((word, i) => {
            return (
                <div key={`print-list-word-${i}`} className="p-1 pb-2 pt-2">
                    <h4>{i+1}. <b>{word.text}</b> <em>({word.part_of_speech})</em> </h4>
                    <h5>{word.definition}</h5>
                </div>
            );
        })

        let printList = (
            <Row>
                <Col>
                    <h2>{wordlist.name}</h2>
                    <h3>{wordlist.description}</h3>
                    <br />
                    {printListItems}
                </Col>
            </Row>
        );

        return (<>
            <PrintProvider>
                <Print printOnly>
                    {printList}
                </Print>
                <NoPrint>
                    <Row className="mt-2">
                        <Col>
                            <h4>{wordlist.name}</h4>
                            <p>{wordlist.description}</p>
                        </Col>
                        <Col>
                            {editButton}
                            <Button 
                                variant='outline-primary'
                                block
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className='mr-2' />
                                Print
                            </Button>
                            <Button 
                                variant='outline-primary'
                                href={`/wordlist/${this.props.wordlistId}/crossword`}
                                block
                            >
                                <FontAwesomeIcon icon={faBorderAll} className='mr-2' />
                                Generate Crossword
                            </Button>
                        </Col>
                    </Row>
                    <Row className="mt-2" >
                        <Col>
                            {list}
                        </Col>
                    </Row>
                </NoPrint>
            </PrintProvider>
        </>);
    }
}

export default WordListWindow;