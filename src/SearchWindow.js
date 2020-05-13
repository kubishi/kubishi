


import React from 'react';
import { 
  Button, Row, Col, InputGroup, FormControl,
  ListGroup, ButtonGroup
} from 'react-bootstrap';
import Pagination from "react-js-pagination";

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
                </Col>
                <Col xs={0} style={{'borderRight': '1px solid #ccc'}} className='d-none d-md-block d-xl-block'></Col>
                <Col className='align-self-center'>
                    <p>{definition}</p>
                </Col>
            </Row>
        );
    }
}

class SentenceSummary extends React.Component {
    render() {
        let { paiute, english } = this.props.sentence;
        return (
            <Row>
                <Col sm={12} md={6} className='text-right align-self-center' >
                    <p><b>{paiute}</b></p>
                </Col>
                <Col xs={0} style={{'borderRight': '1px solid #ccc'}} className='d-none d-md-block d-xl-block'></Col>
                <Col className='align-self-center'>
                    <p>{english}</p>
                </Col>
            </Row>
        );
    }
}
  
class SearchWindow extends React.Component {
    constructor(props) {
        super(props);

        this.resultsPerPage = 10;
        this.langButtons = ['English', 'Paiute'];
        this.searchTypeButtons = ['Words', 'Sentences'];
        this.state = {
            searchLanguage: this.langButtons[0],
            searchType: this.searchTypeButtons[0],
            query: null,
            results: [],
            error: null,
            total: 0,
            activePage: 1
        };
    }

    handleSearch(pageNumber=null) {
        let { query, searchLanguage, searchType } = this.state;
        if (query == null) return;

        let searchTypeRoute = searchType == 'Words' ? 'word' : 'sentence';
        api.get(`/api/search/${searchTypeRoute}`, 
            {
                params: { 
                    query: remove_punctuation(query), 
                    mode: 'fuzzy', 
                    language: searchLanguage.toLowerCase(),
                    offset: pageNumber || 0,
                    limit: this.resultsPerPage,
                },
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({error: res.data.result, results: [], total: 0});
            } else if (res.data.result.length <= 0) {
                this.setState({error: 'No Matches!', results: [], total: 0});
            } else {
                this.setState({error: null, results: res.data.result, total: res.data.total, activePage: pageNumber || 1});
            }
        }).catch(err => console.error(err));
    }

    handleSearchKeyPress(e) {
        if(e.charCode==13){ // Enter key
            this.handleSearch();    
        } 
    }

    render() {
        let { searchLanguage, searchType, results, error, activePage, total, query } = this.state;

        let langButtons = this.langButtons.map((name, i) => {
            return (
                <Button 
                    className='w-100'
                    key={'search-' + name.toLowerCase().replace(' ', '-')}
                    onClick={e => this.setState({searchLanguage: name}, () => this.handleSearch())}
                    variant={searchLanguage == name ? 'primary' : 'outline-primary'}
                >
                    {name}
                </Button>
            );
        });

        let searchTypeButtons = this.searchTypeButtons.map((name, i) => {
            return (
                <Button 
                    className='w-100'
                    key={'search-' + name.toLowerCase().replace(' ', '-')}
                    onClick={e => this.setState({searchType: name}, () => this.handleSearch())}
                    variant={searchType == name ? 'primary' : 'outline-primary'}
                >
                    {name}
                </Button>
            );
        });

        let resultBody;
        let pagination;
        if (error) {
            resultBody = <h5 className='text-center'>{error}</h5>;
        } else {
            let resultItems = results.map((word, i) => {
                let isSentence = word.part_of_speech == null;
                if (isSentence) {
                    return (
                        <ListGroup.Item 
                            key={'sentence-list-' + word._id}
                            // action href={'/word/' + word._id}
                        >
                            <SentenceSummary sentence={word} />
                        </ListGroup.Item>
                    );
                } else {
                    return (
                        <ListGroup.Item 
                            key={'word-list-' + word._id}
                            action href={'/word/' + word._id}
                        >
                            <WordSummary word={word} />
                        </ListGroup.Item>
                    );
                }
            });

            resultBody = (
                <ListGroup variant='flush'>
                    {resultItems}
                </ListGroup>
            );

            if (total > this.resultsPerPage) {
                pagination = (
                    <div className="mt-2">
                        <Pagination
                            activePage={activePage}
                            itemsCountPerPage={this.resultsPerPage}
                            totalItemsCount={total}
                            pageRangeDisplayed={5}
                            onChange={pageNumber => this.handleSearch(pageNumber)}
                            innerClass="pagination justify-content-center"
                            itemClass="page-item"
                            linkClass="page-link"
                        />
                    </div>
                );
            }
        }

        return (
            <div>
                <Row className="mb-2 mt-2 no-gutters">
                    <Col sm={12} md={6} className=''>
                        <ButtonGroup className='d-flex mb-1 mb-md-0 mr-md-1'>
                            {searchTypeButtons}
                        </ButtonGroup>
                    </Col>  
                    <Col sm={12} md={6}>
                        <ButtonGroup className='d-flex'>
                            {langButtons}
                        </ButtonGroup>
                    </Col>
                </Row>
                <Row className="mb-3 no-gutters">
                    <Col>
                        <InputGroup>
                            <FormControl
                                placeholder="Search..."
                                autoFocus
                                aria-label="Search"
                                aria-describedby="search-text"
                                name='query'
                                value={query}
                                onKeyPress={e => this.handleSearchKeyPress(e)}
                                onChange={e => {this.setState({query: e.currentTarget.value})}}
                            />
                            
                            <InputGroup.Append>
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={e => this.handleSearch()}
                                >
                                    Search
                                </Button>
                            </InputGroup.Append>
                        </InputGroup>
                    </Col>
                </Row>
                <Row>
                    <Col className="mt-2">
                        {resultBody}
                        {pagination}
                    </Col>
                </Row>
            </div>
        )
    }
}


export default SearchWindow;