import React from 'react';
import { ListGroup } from 'react-bootstrap';

function WordList(props) {
    let { results } = props;

    let listItems = results.map((word, i) => {
        let { text, definition, part_of_speech } = word;
        part_of_speech = word.part_of_speech || 'unknown';
        return (
            <ListGroup.Item 
                className="p-1 pb-2 pt-2"
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