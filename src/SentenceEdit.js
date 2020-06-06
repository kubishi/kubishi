import React from 'react';

import { Row, Col, Spinner } from 'react-bootstrap';

import SentenceForm from './SentenceForm';
import api from './Api';
import { getUpdates, formatSentence } from './helpers';
import history from './history';

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
        api.get(`/api/sentences/${this.props.sentenceId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                this.setState({sentence: res.data.result});
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveSentence(newSentence) {
        let { sentence } = this.state;
        if (sentence == null) return; // sentence not yet loaded

        let body = getUpdates(formatSentence(sentence), formatSentence(newSentence));
        if (Object.keys(body).length <= 0) return; // no update

        api.put(`/api/sentences/${sentence._id}`, body).then(res => {
            if (res.status == 200 && res.data.success) {
                this.getSentence();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    deleteSentence() {
        let { sentence } = this.state;
        if (sentence == null) return; // sentence not yet loaded

        api.delete(`/api/sentences/${sentence._id}`).then(res => {
            if (res.status == 200) {
                return history.push('/');
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { sentence } = this.state;
        if (sentence == null) return <Spinner />;

        return <SentenceForm sentence={sentence} onSave={sentence => this.saveSentence(sentence)} onDelete={() => this.onDelete()} />;
    }
};

export default SentenceEdit;