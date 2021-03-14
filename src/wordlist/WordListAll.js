
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Button, Col, Image, Row, Spinner } from 'react-bootstrap';
import api from '../Api';
import '../common/common.css';
import { ListGroup } from 'react-bootstrap';
import WordListNew from './WordListNew';
import history from '../common/history';


class WordWindow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wordlists: []
        };
    }

    componentDidMount() {
        this.getWordLists();
    }

    componentDidUpdate(prevProps, prevState) {
        
    }

    getWordLists() {
        let user = this.props.getUser();
        api.get(`/api/users/${user._id}/wordlist`).then(res => {
            if (res.status == 200) {
                this.setState({wordlists: res.data.result});
            } else {
                console.log(res.status, res.data);
                this.setState({wordlists: []});
            }
        }).catch(err => {
            console.error(err);
            this.setState({wordlists: []});
        });
    }
   
    render() {
        let { wordlists } = this.state;

        let listItems = wordlists.map((list, i) => {
            let { name, description, words, _id } = list;
            
            return (
                <ListGroup.Item 
                    className="p-1 pb-2 pt-2"
                    key={'wordlist-list-' + _id}
                    action href={'/wordlist/' + _id}
                >
                    <b>{name} <em>({(words || []).length} words)</em></b>
                    <br />
                    {description}
                </ListGroup.Item>
            );
        });
        
        return (<>
            <Row className="mt-2">
                <Col>
                    <h4 className="text-center">Word Lists</h4>
                    <ListGroup variant='flush'>
                        {listItems}
                    </ListGroup>
                </Col>
            </Row>
            <Row className="mt-2">
                <Col>
                    <Button onClick={e => history.push("/create/wordlist")} variant="outline-success" className='w-100'>    
                            <FontAwesomeIcon icon={faPlus} className='mr-2' />
                            New Word List
                    </Button>
                </Col>
            </Row>
        </>);
    }
}

export default WordWindow;