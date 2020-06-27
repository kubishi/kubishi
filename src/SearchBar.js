import React from 'react';
import {
    Button, Col, Form,
    FormControl, InputGroup, Row
} from 'react-bootstrap';


export default function SearchBar({ autoFocus, showRandomButtons, className }) {      
    const randomButtons = !showRandomButtons ? null : (
        <Row className="mt-1">
            <Col className='mb-1 pr-md-1' xs={12} md={4}>
                <Button type="submit" href='/random/word' block>Random Word</Button> 
            </Col>
            <Col className='mb-1 pl-md-1 pr-md-1' xs={12} md={4}>
                <Button type="submit" href='/random/sentence' block>Random Sentence</Button> 
            </Col>
            <Col className='mb-1 pl-md-1' xs={12} md={4}>
                <Button type="submit" href='/random/article' block>Random Article</Button> 
            </Col>
        </Row> 
    )

    return (
        <Row className={className}>
            <Col>
                <Form action='/search'>
                    <InputGroup>
                        <FormControl
                            placeholder="Type in English or Paiute"
                            autoFocus={autoFocus}
                            aria-label="Search"
                            aria-describedby="search-text"
                            name='query'
                        />
                        
                        <InputGroup.Append>
                            <Button variant="outline-secondary" type='submit'>
                                Search
                            </Button>
                        </InputGroup.Append>
                    </InputGroup>
                </Form>  
                {randomButtons}
            </Col>
        </Row>
    );
}