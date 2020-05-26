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
            autoFocus
            aria-label="Search"
            aria-describedby="search-text"
            name='query'
            value={query}
            onKeyPress={e => this.handleSearchKeyPress(e)}
            onChange={e => this.setState({query: e.currentTarget.value})}
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
                    <Row  className="no-gutters mt-1">
                        <Col className="no-gutters">
                            <Button type="submit" onClick={e => this.getRandom('article')} block>Random Article</Button> 
                        </Col>
                        <Col className="no-gutters ml-1 mr-1">
                            <Button type="submit" onClick={e => this.getRandom('word')} block>Random Word</Button> 
                        </Col>
                        <Col className="no-gutters">
                            <Button type="submit" onClick={e => this.getRandom('sentence')} block>Random Sentence</Button> 
                        </Col>
                    </Row> 
                );
            }     
            return (
                <Row className={this.props.className}>
                    <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                    <Col>
                        <Row>
                            <Col>
                                {this.getSearchBar()}   
                            </Col>
                        </Row> 
                        {randomButtons}
                    </Col>
                    <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                </Row>
                );
            }
        };
        
        
        export default SearchBar;