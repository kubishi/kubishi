import React from 'react';
import {
    Button, Col, Form,
    FormControl, InputGroup, Row
} from 'react-bootstrap';
import Select from 'react-select';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import api from './Api';
import history from './history';
import cookie from 'react-cookies';

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allTags: [],
            allPos: [],
            advanced: this.props.advanced || false
        }
    }

    componentDidMount() {
        const advanced = this.state;
        if (advanced) {
            this.getAllTags();
            this.getAllPos();
        }
    }

    toggleAdvanced() {
        const advanced = !this.state.advanced;
        if (advanced) {
            this.getAllTags();
            this.getAllPos();
            this.setState({ advanced });
        }
    }

    getAllTags() {
        api.get('/api/tags').then(res => {
            if (res.data.success) {
                this.setState({allTags: res.data.result});
            } else {
                console.error(res.data);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    getAllPos() {
        api.get('/api/pos').then(res => {
            if (res.data.success) {
                this.setState({allPos: res.data.result});
            } else {
                console.error(res.data);
            }
        }).catch(err => {
            console.error(err);
        });
    }

    getRandom(path) {
        let params = {fields: ['_id']};
        if (path == 'sentences' && !cookie.load('can_edit')) {
            params.match = JSON.stringify({paiuteTokens: {$exists: true}});
        }

        api.get(`/api/random/${path}`, {params: params}).then(res => {
            if (res.status == 200) {
                console.log(`/${path}/${res.data.result._id}`);
                return history.push(`/${path}/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    randomButtons() { 
        return (
            <Row>
                <Col className='mb-1 pr-md-1' xs={12} md={4}>
                    <Button type="submit" onClick={() => this.getRandom('words')} block>Random Word</Button> 
                </Col>
                <Col className='mb-1 pl-md-1 pr-md-1' xs={12} md={4}>
                    <Button type="submit" onClick={() => this.getRandom('sentences')} block>Random Sentence</Button> 
                </Col>
                <Col className='mb-1 pl-md-1' xs={12} md={4}>
                    <Button type="submit" onClick={() => this.getRandom('articles')} block>Random Article</Button> 
                </Col>
            </Row> 
        );
    }


    simpleRender() {
        const { query, autoFocus, defaultTab } = this.props;
        const defaultTabInput = defaultTab ? <input type="hidden" name="defaultTab" value={defaultTab} /> : null;

        return (
            <Form action='/search'>
                <InputGroup>
                    {defaultTabInput}
                    
                    <InputGroup.Prepend>
                        <Button 
                            variant={this.state.advanced ? "secondary" : "outline-secondary"} 
                            onClick={() => this.toggleAdvanced()}
                        >
                            <FontAwesomeIcon icon={faFilter} />
                        </Button>
                    </InputGroup.Prepend>

                    <FormControl
                        placeholder="Type in English or Paiute"
                        autoFocus={autoFocus}
                        aria-label="Search"
                        aria-describedby="search-text"
                        name='query'
                        defaultValue={query}
                    />

                    <InputGroup.Append>
                        <Button variant="outline-secondary" type="submit" block>
                            Search
                        </Button>
                    </InputGroup.Append>
                </InputGroup>
            </Form>  
        );
    }

    formatArray(x) {
        let y = x || [];
        return Array.isArray(y) ? y : [y];
    }

    advancedRender() {
        const { query, autoFocus, defaultTab } = this.props;
        const { allTags, allPos } = this.state;
        const defaultTabInput = defaultTab ? <input type="hidden" name="defaultTab" value={defaultTab} /> : null;

        let tags = this.formatArray(this.props.tags);
        let pos = this.formatArray(this.props.pos);

        const tagOptions = [...new Set([...allTags, ...tags])].map(tag => { 
            return { value: tag, label: tag} 
        });

        const tagValue = tags.map(tag => { 
            return { value: tag, label: tag} 
        });

        const tagForm = (
            <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Select
                    name='tags'
                    options={tagOptions}
                    isMulti
                    defaultValue={tagValue}
                />
            </Form.Group>
        );

        
        const posOptions = [...new Set([...allPos, ...pos])].map(pos => { 
            return { value: pos, label: pos} 
        });

        console.log(pos);
        const posValue = pos.map(pos => { 
            return { value: pos, label: pos} 
        });

        const posForm = (
            <Form.Group>
                <Form.Label>Part of Speech</Form.Label>
                <Select
                    name='pos'
                    options={posOptions}
                    isMulti
                    defaultValue={posValue}
                />
            </Form.Group>
        );

        return (
            <Form action='/search'>
                <InputGroup className='mb-1'>
                    {defaultTabInput}
                    
                    <InputGroup.Prepend>
                        <Button 
                            variant={this.state.advanced ? "secondary" : "outline-secondary"} 
                            onClick={() => this.setState({advanced: !this.state.advanced})}
                        >
                            <FontAwesomeIcon icon={faFilter} />
                        </Button>
                    </InputGroup.Prepend>

                    <FormControl
                        placeholder="Type in English or Paiute"
                        autoFocus={autoFocus}
                        aria-label="Search"
                        aria-describedby="search-text"
                        name='query'
                        defaultValue={query}
                    />
                </InputGroup>
                <Row>
                    <Col xs='12' lg='6'>
                        {tagForm}
                    </Col>
                    <Col xs='12' lg='6'>
                        {posForm}
                    </Col>
                </Row>
                <Button variant="outline-secondary" type="submit" block>
                    Search
                </Button>
            </Form>  
        );
    }

    render() {
        const { className, showRandomButtons } = this.props;
        const { advanced } = this.state;
        const randomButtons = showRandomButtons ? this.randomButtons() : null;

        return (
            <Row className={className}>
                <Col>
                    {randomButtons}
                    {advanced ? this.advancedRender() : this.simpleRender()}
                </Col>
            </Row>
        );
    }
}


// export default function SearchBar({ query, autoFocus, showRandomButtons, className, defaultTab }) {
//     const randomButtons = showRandomButtons ? randomButtons() : null;

//     const defaultTabInput = defaultTab ? <input type="hidden" name="defaultTab" value={defaultTab} /> : null;
//     return (
//         <Row className={className}>
//             <Col>
//                 {randomButtons}
//                 <Form action='/search'>
//                     <InputGroup>
//                         {defaultTabInput}
                        
//                         <InputGroup.Prepend>
//                             <Button variant="outline-secondary" type='submit'>
//                                 Advanced
//                             </Button>
//                         </InputGroup.Prepend>

//                         <FormControl
//                             placeholder="Type in English or Paiute"
//                             autoFocus={autoFocus}
//                             aria-label="Search"
//                             aria-describedby="search-text"
//                             name='query'
//                             defaultValue={query}
//                         />
                        
//                         <InputGroup.Append>
//                             <Button variant="outline-secondary" type='submit'>
//                                 Search
//                             </Button>
//                         </InputGroup.Append>
//                     </InputGroup>
//                 </Form>  
//             </Col>
//         </Row>
//     );
// }