


import React from 'react';
import { 
  Button, Row, Col, InputGroup, FormControl,
  ListGroup, DropdownButton, Dropdown, ButtonGroup
} from 'react-bootstrap';
import axios from 'axios';

import './SearchWindow.css';
import cookie from 'react-cookies';

const { REACT_APP_API_URL, REACT_APP_API_KEY } = process.env;

const api = axios.create({
    baseURL: REACT_APP_API_URL,
});

class WordSummary extends React.Component {
    render() {
        let { text, definition, part_of_speech } = this.props.word;
        part_of_speech = part_of_speech.toLowerCase().replace('_', ' ');
        return (
            <Row>
                <Col
                    xs={4}
                    style={{'paddingRight': '20px', 'borderRight': '1px solid #ccc'}}
                    className='text-right align-self-center'
                >
                    <h5>{text}</h5>
                    <em>{part_of_speech}</em>
                </Col>
                <Col className='align-self-center'>
                    <p>{definition.text}</p>
                </Col>
            </Row>
        );
    }
}
  
class SearchWindow extends React.Component {
    constructor(props) {
        super(props);

        this.buttons = ['Definition', 'Paiute', 'English Word'];
        this.state = {
            searchType: this.buttons[0],
            query: null,
            results: [],
            error: null,
        };
    }

    defaultHeader() {
        let default_header = {REACT_APP_API_KEY: REACT_APP_API_KEY};
        let user = this.props.getUser();
        if (user) {
            default_header.user_id = user.ids[0];
        }
        return default_header;
    }

    handleSearch(e) {
        let { query } = this.state;
        if (query == null) return;

        let url = '/api/search';
        let params = { query: query, mode: 'fuzzy', populate: "true" };
        let callback;

        if (this.state.searchType == "Definition") {
            url += '/definition';
            params.is_paiute = true;
            callback = res => {
                if (!res.data.success) {
                    this.setState({error: res.data.result, results: []});
                } else if (res.data.result.length <= 0) {
                    this.setState({error: 'No Matches!', results: []});
                } else {
                    let results = res.data.result
                        .filter(definition => definition != null && definition.word != null)
                        .map((definition, i) => {
                            let word = definition.word;
                            word.definition = definition;
                            return word;
                        });
                    this.setState({error: null, results: results});
                }
            };
        } else {
            url += '/word';
            params.is_paiute = this.state.searchType == "Paiute";
            callback = res => {
                if (!res.data.success) {
                    this.setState({error: res.data.result, results: []});
                } else if (res.data.result.length <= 0) {
                    this.setState({error: 'No Matches!', results: []});
                } else {
                    this.setState({error: null, results: res.data.result});
                }
            };
        }

        let config = { headers: this.defaultHeader(), params: params };
        api.get(url, config, {headers: {signed_request: cookie.load('signed_request')}}).then(callback).catch(err => {
            console.error(err.result);
        });
    }

    handleSearchKeyPress(e) {
        if(e.charCode==13){ // Enter key
            this.handleSearch(e);    
        } 
    }

    render() {
        let { searchType, results, error } = this.state;

        let buttons = this.buttons.map((name, i) => {
            let key = 'search-' + name.toLowerCase().replace(' ', '-');
            return (
                <Button 
                    className='w-100'
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
                        key={'word-list-' + word.id}
                        action href={'/word/' + word.id}
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
                                aria-label="Search"
                                aria-describedby="search-text"
                                onKeyPress={e => this.handleSearchKeyPress(e)}
                                onChange={e => {this.setState({query: e.currentTarget.value})}}
                            />
                            
                            <InputGroup.Append>
                                <Button variant="outline-secondary" 
                                        onClick={e => this.handleSearch(e)}
                                >Search</Button>
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