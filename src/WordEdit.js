
import React from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './Api';
import './common.css';
import history from './history';
import WordForm from './WordForm';


class WordWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            word: null,
        };
    }

    popToast(message, isError=false) {
        let toastFun = isError ? toast.error : toast.success;
        return toastFun(message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            className: isError ? 'bg-danger' : 'bg-success'
        });
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
                this.popToast('Succesfully updated word!');
            } else {
                console.log(res.status, res.data);
                this.popToast('Error updating word!', true);
            }
        }).catch(err => {
            this.popToast('Error updating word!', true);
            console.error(err);
        });
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
            <Row className='mt-3'>
                <Col>
                    <ToastContainer />
                    <Button variant='outline-primary' block className='mb-2' href={`/words/${word._id}`}>
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