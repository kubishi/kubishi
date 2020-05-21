import React from 'react';
import { Row, Col, ListGroup } from 'react-bootstrap';

function WordList(props) {
    let { results } = props;

    let listItems = results.map((article, i) => {
        let { title, keywords, tags } = article;
        return (
            <ListGroup.Item 
                className="py-2"
                key={'article-list-' + article._id}
                action href={'/article/' + article._id}
            >
                <b>{title}</b>
                <br />
                {tags.join(", ")}
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