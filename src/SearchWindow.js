


import React from 'react';
import { 
  Button, Row, Col, InputGroup, FormControl,
  ListGroup, ButtonGroup
} from 'react-bootstrap';

import './SearchWindow.css';
import { remove_punctuation } from './helpers';

import api from './Api';

class WordSummary extends React.Component {
    render() {
        let { text, definition, part_of_speech } = this.props.word;
        part_of_speech = part_of_speech.toLowerCase().replace('_', ' ');
        return (
            <Row>
                <Col sm={12} md={4} className='text-right align-self-center' >
                    <h5>{text}</h5>
                    <em>{part_of_speech}</em>
                    <span></span>
                </Col>
                <Col xs={0} style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}} className='d-none d-md-block d-xl-block'></Col>
                <Col className='align-self-center'>
                    <p>{definition}</p>
                </Col>
            </Row>
        );
    }
}
  
class SearchWindow extends React.Component {
    constructor(props) {
        super(props);

        this.buttons = ['English', 'Paiute'];
        this.state = {
            searchType: this.buttons[0],
            query: null,
            results: [],
            error: null,
        };
    }

    handleSearch(e) {
        let { query, searchType } = this.state;
        if (query == null) return;

        api.get('/api/search/word', 
            {
                params: { 
                    query: remove_punctuation(query), 
                    mode: 'fuzzy', 
                    language: searchType.toLowerCase()
                },
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({error: res.data.result, results: []});
            } else if (res.data.result.length <= 0) {
                this.setState({error: 'No Matches!', results: []});
            } else {
                this.setState({error: null, results: res.data.result});
            }
        }).catch(err => console.error(err));
    }

    handleSearchKeyPress(e) {
        if(e.charCode==13){ // Enter key
            this.handleSearch(e);    
        } 
    }

    render() {
        let { searchType, results, error } = this.state;

        let buttons = this.buttons.map((name, i) => {
            return (
                <Button 
                    className='w-100'
                    key={'search-' + name.toLowerCase().replace(' ', '-')}
                    onClick={e => this.setState({'searchType': name}, () => this.handleSearch(e))}
                    variant={searchType == name ? 'primary' : 'outline-primary'}
                >
                    {name}
                </Button>
            );
        });

        let resultBody;
        if (error) {
            resultBody = <h5 className='text-center'>{error}</h5>;
        } else {
            let resultItems = results.map((word, i) => {
                return (
                    <ListGroup.Item 
                        key={'word-list-' + word._id}
                        action href={'/word/' + word._id}
                    >
                        <WordSummary key={'word-' + i.toString()} word={word} />
                    </ListGroup.Item>
                );
            });
            resultBody = (
                <ListGroup variant='flush'>
                    {resultItems}
                </ListGroup>
            );
        }

        return (
            <div className='m-3'>
                <Row className="mb-2">
                    <Col>
                    <ButtonGroup
                        className='d-flex'
                    >
                        {buttons}
                    </ButtonGroup>
                    </Col>
                </Row>
                <Row className="mb-3">
                    <Col>
                        <InputGroup>
                            <FormControl
                                placeholder="Search..."
                                autoFocus
                                aria-label="Search"
                                aria-describedby="search-text"
                                name='query'
                                value={this.state.query}
                                onKeyPress={e => this.handleSearchKeyPress(e)}
                                onChange={e => {this.setState({query: e.currentTarget.value})}}
                            />
                            
                            <InputGroup.Append>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={e => this.handleSearch(e)}
                                >
                                    Search
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {resultBody}
                    </Col>
                </Row>
            </div>
        )
    }
}


export default SearchWindow;