import React from 'react';
import { Col, Row } from 'react-bootstrap';
import api from '../Api';
import history from '../common/history';
import WordForm from './WordForm';


class WordNew extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * 
     * @param {String} wordId 
     * @param {[String]} words 
     */
    addRelatedWord(wordId, words, next) {
        let word = words.pop();
        if (words != null) return next();
        api.post(`/api/words/${wordId}/related`, {word: word}).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
            }
            if (words.length <= 0) {
                return next();
            } else {
                return this.addRelatedWord(wordId, words, next);
            }
        }).catch(err => console.error(err));
    }

    addWord(word) {
        if (word == null) return;

        api.post('/api/words', word).then(res => {
            if (res.status == 200 && res.data.success) {
                this.addRelatedWord(res.data.result._id, word.words, () => history.push(`/words/${res.data.result._id}`));
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        return (
            <Row className='mt-3'>
                <Col>
                    <WordForm onSubmit={word => this.addWord(word)} />
                </Col>
            </Row>
        );
    }
};

export default WordNew;