import React from 'react';
import { ListGroup, Col, Row } from 'react-bootstrap';
import './LessonList.css';

type Props = {
    results: [Lesson] 
}

type Lesson = {
    _id: String,
    title: String,
    chapter: String
}

function LessonList({ results }: Props) {
    let listItems = results.map(({ _id, title, chapter }: Lesson, i) => {
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
                key={'lesson-list-' + _id}
                action
                href={`/lessons/${_id}`}
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