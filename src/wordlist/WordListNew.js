import React from 'react';
import { Col, Row } from 'react-bootstrap';
import api from '../Api';
import history from '../common/history';
import WordListForm from './WordListForm';


class WordListNew extends React.Component {
    constructor(props) {
        super(props);
    }

    addWordList(wordlist) {
        if (wordlist == null) return;

        api.post('/api/wordlist', wordlist).then(res => {
            if (res.status == 200 && res.data.success) {
                history.push(`/wordlist/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        return (
            <Row className='mt-3'>
                <Col>
                    <WordListForm onSubmit={wordlist => this.addWordList(wordlist)} />
                </Col>
            </Row>
        );
    }
};

export default WordListNew;