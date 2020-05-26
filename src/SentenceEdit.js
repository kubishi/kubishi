import React from 'react';

import { Row, Col, Spinner } from 'react-bootstrap';

import SentenceForm from './SentenceForm';
import api from './Api';
import { getUpdates } from './helpers';

class SentenceEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sentence: null,
        };
    }

    componentDidMount() {
        this.getSentence();
    }

    getSentence() {
        api.get(`/api/sentence/${this.props.sentenceId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                this.setState({sentence: res.data.result});
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveSentence(new_sentence) {
        let { sentence } = this.state;
        if (sentence == null) return; // sentence not yet loaded

        let body = getUpdates(sentence, new_sentence);
        if (Object.keys(body).length <= 0) return; // no update

        api.put(`/api/sentence/${sentence._id}`, body).then(res => {
            if (res.status == 200 && res.data.success) {
                this.getSentence();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { sentence } = this.state;
        if (sentence == null) return <Spinner />;

        return (
            <Row>
                <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                <Col>
                    <SentenceForm sentence={sentence} onSave={sentence => this.saveSentence(sentence)} />
                </Col>
                <Col className='d-none d-md-block d-xl-block' md={3}></Col>
            </Row>
        );
    }
};

export default SentenceEdit;