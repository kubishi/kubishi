
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import lodash from 'lodash';
import React from 'react';
import { Button, ButtonGroup, Col, Form, ListGroup, Row } from 'react-bootstrap';
import '../common/common.css';
import { getUpdates } from '../common/helpers';


class WordListForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = lodash.cloneDeep(this.props.wordlist) || {};
        this.state.related_options = [];
    }

    submitWordList() {
        let newWordList = lodash.cloneDeep(lodash.pick(this.state, ['name', 'description']));
        this.props.onSubmit(newWordList);
    }

    deleteWordList() {
        if (this.props.onDelete != null && window.confirm('Are you sure you want to delete this word list?')) {
            this.props.onDelete();
        }
    }

    hasChanged() {
        let newWordList = lodash.pick(this.state, ['name', 'description']);
        return Object.keys(getUpdates(this.props.wordlist, newWordList)).length > 0;
    }

    render() {
        let { submitText, deleteText, onDelete, wordlist } = this.props;
        let { name, description } = this.state;

        let saveDisabled = false;
        if (wordlist != null) {
            saveDisabled = !this.hasChanged();
        }

        let buttons;
        if (onDelete != null) {
            buttons = (
                <Row className="mt-3 mb-2 no-gutter">
                    <Col>
                        <ButtonGroup className='d-flex' id={`form-wordlist-buttons-${wordlist._id || "new"}`}>
                            <Button onClick={e => this.deleteWordList()} variant="outline-danger" className='w-100'>    
                                <FontAwesomeIcon icon={faTrash} className='mr-2' />
                                {deleteText}
                            </Button>
                            <Button 
                                className='w-100' 
                                href='#'
                                variant="outline-success" 
                                disabled={saveDisabled}
                                onClick={e => this.submitWordList()} 
                            >
                                {submitText}
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>
            );
        } else {
            buttons = (
                <Row className="mt-3 mb-2">
                    <Col>
                        <Button 
                            variant='outline-success'
                            onClick={e => this.submitWordList()} 
                            href='#' 
                            disabled={saveDisabled} 
                            block
                        >
                            {submitText}
                        </Button>
                    </Col>
                </Row>
            );
        }

        let form = (
            <Form>
                <Form.Row>
                    <Col xs={12}>
                        <Form.Group controlId='formName'>
                            <Form.Label>Name</Form.Label>
                            <Form.Control 
                                type='text' value={name}
                                onChange={e => {this.setState({name: e.target.value})}}
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>
                
                <Form.Row>
                    <Col xs={12}>
                        <Form.Group controlId='formDescription'>
                            <Form.Label>Description</Form.Label>
                            <Form.Control as="textarea" defaultValue={description} 
                                onChange={e => this.setState({description: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>
                {buttons}
            </Form>
        );

        return form;
    }
};

WordListForm.defaultProps = {
    submitText: 'Submit',
    deleteText: 'Delete',
};

export default WordListForm;