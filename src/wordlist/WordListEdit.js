import React from 'react';
import { Col, Row } from 'react-bootstrap';
import api from '../Api';
import history from '../common/history';
import WordListForm from './WordListForm';


class WordListEdit extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wordlist: null
        }
    }

    componentDidMount() {
        this.getWordList();
    }
    
    getWordList() {
        api.get(`/api/wordlist/${this.props.wordlistId}`, {params: {fields: ['name', 'description']}}).then(res => {
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

    updateWordList(wordlist) {
        if (wordlist == null) return;
        api.put(`/api/wordlist/${this.props.wordlistId}`, wordlist).then(res => {
            if (res.status == 200 && res.data.success) {
                history.push(`/wordlist/${this.props.wordlistId}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }


    deleteWordList() {
        let { wordlist } = this.state;
        if (wordlist == null) return; // word not loaded yet

        api.delete(`/api/wordlist/${wordlist._id}`).then(res => {
            if (res.status == 200) {
                return history.push('/wordlist');
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { wordlist } = this.state;
        if (wordlist == null) {
            return <></>;
        }

        return (
            <Row className='mt-3'>
                <Col>
                    <WordListForm wordlist={wordlist} onSubmit={wordlist => this.updateWordList(wordlist)} onDelete={() => this.deleteWordList()} />
                </Col>
            </Row>
        );
    }
};

export default WordListEdit;