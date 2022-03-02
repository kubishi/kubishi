import React from 'react';
import { ListGroup, Col, Row } from 'react-bootstrap';
import './LessonList.css';


function LessonList(props) {
    let { results } = props;

    let listItems = results.map((lesson, i) => {
        let { title, chapter } = lesson;
        let item = (
            <>
                <b>{chapter}</b>
                <br />
                {title}
            </>
        );
        return (
            <ListGroup.Item 
                className="p-1 pb-2 pt-2"
                key={'lesson-list-' + lesson._id}
                action
                href={`/lessons/${lesson._id}`}
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


export default LessonList;