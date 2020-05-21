import React from 'react';

import { Form, Row, Col, Button } from 'react-bootstrap';

import PartOfSpeech from './PartOfSpeech';
import api from './Api';
import history from './history';

class NewWord extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            addWordText: null,
            addWordDef: null,
            addWordPos: null,
        }
    }

    getWordForm() {
        let { addWordText, addWordDef } = this.state;
        let posOptions = PartOfSpeech.map((part_of_speech, i) => {
            let pos = part_of_speech.toLowerCase().replace('_', ' ');
            return (
                <option key={'option-pos-' + i}>{pos}</option>
            );
        });
        return (
          <Form>
              <Form.Group controlId='formAddWord'>
                  <Form.Label>Word</Form.Label>
                  <Form.Control 
                      type='text'
                      isValid={addWordText != null && addWordText != ''}
                      onChange={e => {this.setState({addWordText: e.target.value})}}
                  />
              </Form.Group>
    
              <Form.Group controlId='formAddPOS'>
                  <Form.Label>Part of Speech</Form.Label>
                  <Form.Control 
                      as="select" 
                      defaultValue='unknown'
                      isValid={addWordText != null && addWordText != ''}
                      onChange={e => {this.setState({addWordPos: e.target.value})}}
                  >
                      {posOptions}
                  </Form.Control>
              </Form.Group>
    
              <Form.Group controlId='formAddDefinition'>
                  <Form.Label>Definition</Form.Label>
                  <Form.Control 
                    as="textarea"
                    isValid={addWordDef != null && addWordDef != ''}
                    onChange={e => this.setState({addWordDef: e.target.value})}
                  />
              </Form.Group>

              
            <Button
                variant='outline-success'
                onClick={e => this.addWord()}
            >
                Submit
            </Button>
          </Form>
        );
    }

    addWord() {    
        let { addWordText, addWordDef, addWordPos } = this.state;
    
        let fields = [addWordText, addWordDef, addWordPos];
        if (fields.some(e => e == null)) {
          console.error('Some of the fields are null: ', fields);
          return;
        }
    
        api.post('/api/word', 
          {
            text: addWordText,
            definition: addWordDef,
            part_of_speech: addWordPos.toUpperCase().replace(' ', '_'),
            sentences: [],
            words: []
          }
        ).then(res => {
          if (res.status == 200) {
            history.push(`/word/${res.data.result._id}`);
          } else {
            console.log(res.status, res.data);
          }
        }).catch(err => console.error(err));
    }
    
    render() {

        return (
            <Row className="mt-3">
                <Col>
                    <Row>
                        <Col className="text-center">
                            <h4>Create New Word</h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                        <Col>
                            {this.getWordForm()}
                        </Col>
                        <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                    </Row>
                </Col>
            </Row>
        );
    }
};


export default NewWord;