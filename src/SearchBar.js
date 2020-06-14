import React from 'react';

import { 
    Button, Col, Row, 
    InputGroup, FormControl
} from 'react-bootstrap';

import history from './history';
import qs from 'query-string';
import api from './Api';

class SearchBar extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            query: (this.props.query || null),
        };
    }
    
    handleSearch(e) {
        let { query } = this.state;
        if (query != null && query != '') {
            return history.push({
                pathname: '/search',
                search: qs.stringify({query: query}),
            });
        }
    }
    
    handleSearchKeyPress(e) {
        if(e.charCode==13){ // Enter key
            this.handleSearch();    
        } 
    }
    
    getSearchBar() {
        let { query } = this.state;

        return (
            <InputGroup>
                <FormControl
                    placeholder=""
                    ref="searchBar"
                    autoFocus={this.props.autoFocus}
                    aria-label="Search"
                    aria-describedby="search-text"
                    name='query'
                    value={query}
                    onKeyPress={e => this.handleSearchKeyPress(e)}
                    onChange={e => this.setState({ query: e.currentTarget.value })}
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
        );
    }

    getRandom(path) {
        api.get(`/api/random/${path}`, 
            {params: {fields: ['_id']}}
        ).then(res => {
            if (res.status == 200) {
                return history.push(`/${path}/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }
    
    render() {       
        let randomButtons;
        if (this.props.showRandomButtons) {
            randomButtons = (
                <Row className="mt-1">
                    <Col className='mb-1 pr-md-1' xs={12} md={4}>
                        <Button type="submit" onClick={e => this.getRandom('articles')} block>Random Article</Button> 
                    </Col>
                    <Col className='mb-1 pl-md-1 pr-md-1' xs={12} md={4}>
                        <Button type="submit" onClick={e => this.getRandom('words')} block>Random Word</Button> 
                    </Col>
                    <Col className='mb-1 pl-md-1' xs={12} md={4}>
                        <Button type="submit" onClick={e => this.getRandom('sentences')} block>Random Sentence</Button> 
                    </Col>
                </Row> 
            );
        }     
        return (
            <Row className={this.props.className}>
                <Col>
                    {this.getSearchBar()}   
                    {randomButtons}
                </Col>
            </Row>
        );
    }
};
        
SearchBar.defaultProps = {
    autoFocus: false,
};
        
export default SearchBar;