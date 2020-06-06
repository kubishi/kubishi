import React from 'react';
import { Spinner, Row, Col, Button, Image } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import api from './Api';
import history from './history';

class SentenceWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            sentence: null
        };

        if (this.props.sentence != null) {
            this.state.sentence = this.props.sentence;
        }
    }

    componentDidMount() {
        let { sentence, sentenceId } = this.props;
        if (sentence == null) {
            api.get(`/api/sentences/${sentenceId}`).then(res => {
                if (res.status == 200 && res.data.success) {
                    this.setState({ sentence: res.data.result });
                } else {
                    console.log(res.status, res.data);
                    this.setState({ sentence: false });
                }
            }).catch(err => {
                console.error(err);
                this.setState({ sentence: false });
            });
        }
    }

    render() {
        let { sentence } = this.state;
        let { canEdit } = this.props;
        if (sentence == null) return <Spinner />;
        else if (sentence == false) return <h5>We can't find the sentence you're looking for.</h5>;

        let audioPlayer;
        if (sentence.audio != null && sentence.audio.data != null) {
            audioPlayer = (
                <Row>
                    <Col>
                        <audio src={sentence.audio.data} controls />
                    </Col>
                </Row>
            );
        }

        let editButton;
        if (canEdit) {
            editButton = (
                <Row>
                    <Col>
                        <Button 
                            variant='outline-primary'
                            onClick={e => history.push(`/sentences/${sentence._id}?mode=edit`)}
                            block
                        >
                            <FontAwesomeIcon icon={faEdit} className='mr-2' />
                            Edit
                        </Button>
                    </Col>
                </Row>
            );
        }

        let imageSquare;
        if (sentence.image != null && sentence.image.data != null) {
            imageSquare = <Image src={sentence.image.data} rounded style={{maxHeight: '30vh', maxWidth: '100%'}} />;
        }

        return (
            <Row className='mt-3'>
                <Col className={imageSquare == null ? 'd-none d-md-block d-xl-block': ''} md={3}></Col>
                <Col>
                    {editButton}
                    <Row>
                        <Col xs={12} md={imageSquare == null ? 12 : 6}>
                            <b>{sentence.paiute}</b>
                            <p>{sentence.english}</p>
                        </Col>
                        {audioPlayer}
                        {imageSquare}
                    </Row>
                    {audioPlayer}
                </Col>
                <Col className={imageSquare == null ? 'd-none d-md-block d-xl-block': ''} md={3}></Col>
            </Row>
        );
    }
};

export default SentenceWindow;