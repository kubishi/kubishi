import React from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';

function WordList(props) {
    let { results } = props;

    let listItems = results.map((word, i) => {
        let { text, definition, part_of_speech } = word;
        part_of_speech = part_of_speech.toLowerCase().replace('_', ' ');
        return (
            <ListGroup.Item 
                className="p-1"
                key={'word-list-' + word._id}
                action href={'/words/' + word._id}
            >
                <b>{text} <em>({part_of_speech})</em></b>
                <br />
                {definition}
            </ListGroup.Item>
        );
    });

    return (
        <ListGroup variant='flush'>
            {listItems}
        </ListGroup>
    );
};


export default WordList;