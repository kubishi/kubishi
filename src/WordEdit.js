
import React from 'react';
import { Row, Col, Button, Spinner } from 'react-bootstrap';

import WordForm from './WordForm';

import api from './Api';
import history from './history';
import './common.css';

class WordWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            word: null,
        };
    }

    componentDidMount() {
        this.getWord();
    }

    getWord() {
        api.get('/api/words/' + this.props.wordId).then(res => {
            if (res.status == 200) {
                let word = res.data.result;
                this.setState({ word });
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => {
            console.error(err);
            this.setState({word: false});
        });
    }
   
    saveWord(word) { 
        console.log(`/api/words/${this.props.wordId}`)
        api.put(`/api/words/${this.props.wordId}`, word).then(res => {
            if (res.status == 200) {
                this.getWord()
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    deleteWord() {
        let { word } = this.state;
        if (word == null) return; // word not loaded yet

        api.delete(`/api/words/${word._id}`).then(res => {
            if (res.status == 200) {
                return history.push('/');
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { word } = this.state;

        if (word == null) {
            return <Spinner />;
        } else if (word == false) {
            return (
                <div className='mt-3 text-center'>
                    <h4>We can't find the word you're looking for!</h4>
                </div>
            );
        }

        return (
            <Row className='m-3'>
                <Col>
                    <Button variant='outline-primary' block className='mb-2' onClick={e => {
                        return history.push(`/words/${word._id}`);
                    }}>
                        Back to Word
                    </Button>
                    <WordForm 
                        word={word} 
                        submitText="Save"
                        onSubmit={word => this.saveWord(word)} 
                        onDelete={e => this.deleteWord()} 
                    />
                </Col>
            </Row>
        );
    }
}

export default WordWindow;