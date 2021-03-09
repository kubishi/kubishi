import React from 'react';
import { ListGroup } from 'react-bootstrap';

function WordList(props) {
    let { results } = props;

    let listItems = results.map((article, i) => {
        let { title, keywords, tags } = article;
        return (
            <ListGroup.Item 
                className="p-1 pb-2 pt-2"
                key={'article-list-' + article._id}
                action href={'/articles/' + article._id}
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