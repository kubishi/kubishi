import React from 'react';
import { Button, Col, Row, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './Api';
import { formatSentence } from './helpers';
import history from './history';
import SentenceForm from './SentenceForm';


class SentenceEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sentence: null,
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

        let body = formatSentence(newSentence);
        api.put(`/api/sentences/${sentence._id}`, body).then(res => {
            if (res.status == 200 && res.data.success) {
                this.popToast('Successfully updated sentence!');
                this.getSentence();
            } else {
                this.popToast('Error updating sentence', true);
                console.log(res.status, res.data);
            }
        }).catch(err => {
            this.popToast('Error updating sentence', true);
            console.error(err);
        });
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

        return (
            <Row className='m-3'>
                <Col>
                    <ToastContainer />
                    <Button variant='outline-primary' block className='mb-2' href={`/sentences/${sentence._id}`}>
                        Back to Sentence
                    </Button>
                    <SentenceForm 
                        sentence={sentence} 
                        onSave={sentence => this.saveSentence(sentence)} 
                        onDelete={() => this.deleteSentence()} 
                    />
                </Col>
            </Row>
        );
    }
};

export default SentenceEdit;