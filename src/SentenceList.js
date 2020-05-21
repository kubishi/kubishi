import React from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';

import './SentenceList.css';

function SentenceList(props) {
    let { results } = props;

    let listItems = results.map((sentence, i) => {
        let { paiute, english } = sentence;
        return (
            <ListGroup.Item 
                className="py-2"
                key={'sentence-list-' + sentence._id}
                action href={'/sentence/' + sentence._id}
            >   
                <b>{paiute}</b>
                <br />
                {english}
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