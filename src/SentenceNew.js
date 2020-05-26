import React from 'react';

import { Row, Col } from 'react-bootstrap';
import SentenceForm from './SentenceForm';

import api from './Api';
import history from './history';

class SentenceNew extends React.Component {
    constructor(props) {
        super(props);
    }

    addSentence(sentence) {
        if (sentence == null) return;

        api.post('/api/sentence', sentence).then(res => {
            if (res.status == 200 && res.data.success) {
                return history.push(`/sentence/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        return (
            <Row>
                {/* <Col className='d-none d-md-block d-xl-block' md={3}></Col> */}
                <Col>
                    <SentenceForm onSubmit={sentence => this.addSentence(sentence)} center />
                </Col>
                {/* <Col className='d-none d-md-block d-xl-block' md={3}></Col> */}
            </Row>
        );
    }
};

export default SentenceNew;