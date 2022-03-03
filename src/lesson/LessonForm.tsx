import React, { useState } from 'react';
import { ListGroup, Col, Row, Form } from 'react-bootstrap';
import './LessonList.css';
import api from '../Api';
import Select from 'react-select';


type Props = {
    lesson: Lesson
}

type Word = {
    text: string,
    definition: string,
    image: {
        data: string,
        filename: string
    },
    audio: {
        data: string,
        filename: string
    },
    part_of_speech: string,
    notes: string
}

type Sentence = {
    paiute: string,
    english: string,
    image: {
        data: string,
        filename: string
    },
    audio: {
        data: string,
        filename: string
    },
    notes: string,
    paiuteTokens: [{
        token_type: string,
        text: string,
        token_map: [Number],
        word: Word
    }],
    englishTokens: [{
        token_type: string,
        text: string,
        word: Word
    }]
}

type LessonWord = {
    word: Word,
    difficulty: Number,
    preferredEnglish: [string],
    preferredPaiute: [string],
    acceptableEnglish: [string],
    acceptablePaiute: [string]
}

type LessonSentence = {
    sentence: Sentence,
    difficulty: Number,
    preferredEnglish: [string],
    preferredPaiute: [string],
    acceptableEnglish: [string],
    acceptablePaiute: [string]
}

type Lesson = {
    _id: string,
    title: string,
    words: [LessonWord],
    sentences: [LessonSentence]
}

function wordSearch(query: string) {
    if (!query) return [];
    api.get('/api/search/words', 
        {
            params: { 
                query: query, 
                mode: 'fuzzy',
                searchFields: ['text', 'definition']
            }
        }
    ).then(res => {
        if (res.status != 200 || !res.data.success) {
            console.log(res.status, res.data);
            return [];
        } else if (res.data.result.length <= 0) {
            return [];
        } else {
            return res.data.result.map(word => word === null ? null : {
                label: `${word.text} (${word.part_of_speech}): ${word.definition}`,
                value: word
            });
        }
    }).catch(err => console.error(err));
}

function wordForm(lessonWord: LessonWord, i: Number) {
    let [word, setWord] = useState(lessonWord.word);
    let [options, setOptions] = useState([]);
    
    const [prefEnglish, setPrefEnglish] = useState(lessonWord.preferredEnglish.join('\n'));
    const [acceptEnglish, setAcceptEnglish] = useState(lessonWord.acceptableEnglish.join('\n'));
    const [prefPaiute, setPrefPaiute] = useState(lessonWord.preferredPaiute.join('\n'));
    const [acceptPaiute, setAcceptPaiute] = useState(lessonWord.acceptablePaiute.join('\n'));

    return (
        <>
            <Form.Group controlId={`word-select-${i}`}>
                <Select 
                    placeholder={word === null ? 'Find Word...' : `${word.text} (${word.part_of_speech}): ${word.definition}`}
                    defaultValue={word !== null ? word : null}
                    onChange={selected => setWord(selected.value)}
                    onInputChange={query => setOptions(wordSearch(query))}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Preferred English Translations</Form.Label>
                <Form.Control 
                    as='textarea' 
                    defaultValue={prefEnglish} 
                    onChange={e => {setPrefEnglish(e.target.value)}} rows={3}
                />
            </Form.Group>
        </>
    );
}

function wordForms(words: [{
                        word: Word,
                        difficulty: Number,
                        preferredEnglish: [string],
                        preferredPaiute: [string],
                        acceptableEnglish: [string],
                        acceptablePaiute: [string]
                    }]) {

    return (
        <ListGroup>
            {
                words.map(word => {
                    wordForm(word.word)
                })
            }
        </ListGroup>
    );

}

function LessonForm(props: Props) {
    const [lesson, setLesson] = useState(props.lesson)

    let form = (
        <Form>
            <Form.Row>
                <Col xs={12}>
                    <Form.Group controlId='formLessonTitle'>
                        <Form.Label>Lesson</Form.Label>
                        <Form.Control 
                            type='title' value={lesson.title}
                            onChange={e => setLesson({...lesson, title: e.target.value})}
                        />
                    </Form.Group>
                </Col>
            </Form.Row>
            {wordForms}
            <Button onClick={e => history.push("/create/wordlist")} variant="outline-success" className='w-100'>    
                    <FontAwesomeIcon icon={faPlus} className='mr-2' />
                    New Word List
            </Button>
            {sentenceForms}
        </Form>
    );
}