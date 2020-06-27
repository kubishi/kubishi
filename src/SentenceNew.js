import React from 'react';
import api from './Api';
import { formatSentence } from './helpers';
import history from './history';
import SentenceForm from './SentenceForm';

class SentenceNew extends React.Component {
    constructor(props) {
        super(props);
    }

    addSentence(sentence) {
        if (sentence == null) return;

        let body = formatSentence(sentence);
        if (Object.keys(body).length <= 0) return; // no update

        api.post('/api/sentences', body).then(res => {
            if (res.status == 200 && res.data.success) {
                return history.push(`/sentences/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        return <SentenceForm onSave={sentence => this.addSentence(sentence)} />;
    }
};

export default SentenceNew;