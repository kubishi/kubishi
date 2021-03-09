import React from 'react';
import { ListGroup, Col, Row } from 'react-bootstrap';
import './SentenceList.css';


function SentenceList(props) {
    let { results } = props;

    let listItems = results.map((sentence, i) => {
        let { paiute, english, audio } = sentence;
        let item = (
            <>
                <b>{paiute}</b>
                <br />
                {english}
            </>
        );
        if (audio != null && audio.data != null) {   
            item = (
                <Row>
                    <Col xs={12} lg={5} className="align-self-center">
                        {item}
                    </Col>
                    <Col xs={12} lg={7}>
                        <div style={{margin: '0 auto', display: 'table'}}>
                            <audio src={audio.data} controls />
                        </div>
                    </Col>
                </Row>
            );
        }
        return (
            <ListGroup.Item 
                className="p-1 pb-2 pt-2"
                key={'sentence-list-' + sentence._id}
                action
                href={`/sentences/${sentence._id}`}
            >   
                {item}
            </ListGroup.Item>
        );
    });

    return (
        <ListGroup variant='flush'>
            {listItems}
        </ListGroup>
    );
};


export default SentenceList;