
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Image, Row, Spinner } from 'react-bootstrap';
import api from '../Api';
import '../common/common.css';
import WordList from '../word/WordList'

class WordWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wordlist: null
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

        return (<>
            <Row className="mt-2">
                <Col>
                    <h4>{wordlist.name}</h4>
                    <p>{wordlist.description}</p>
                </Col>
                <Col>
                    {editButton}
                </Col>
            </Row>
            <Row className="mt-2">
                <Col>
                    {list}
                </Col>
            </Row>
        </>);
    }
}

export default WordWindow;