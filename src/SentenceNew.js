import React from 'react';

import SentenceForm from './SentenceForm';

import api from './Api';
import history from './history';

class SentenceNew extends React.Component {
    constructor(props) {
        super(props);
    }

    addSentence(sentence) {
        if (sentence == null) return;

        api.post('/api/sentences', sentence).then(res => {
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