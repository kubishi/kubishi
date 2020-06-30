import React from 'react';
import {
    Button, Col, Form,
    FormControl, InputGroup, Row
} from 'react-bootstrap';


export default function SearchBar({ query, autoFocus, showRandomButtons, className, defaultTab }) {
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

    const defaultTabInput = defaultTab ? <input type="hidden" name="defaultTab" value={defaultTab} /> : null;
    return (
        <Row className={className}>
            <Col>
                <Form action='/search'>
                    <InputGroup>
                        {defaultTabInput}
                        <FormControl
                            placeholder="Type in English or Paiute"
                            autoFocus={autoFocus}
                            aria-label="Search"
                            aria-describedby="search-text"
                            name='query'
                            defaultValue={query}
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