import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { getTagLabel } from './helpers';

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
                {tags.map(tag => getTagLabel(tag)).join(", ")}
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