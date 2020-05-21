import React from 'react';

import { Form, Row, Col, Button } from 'react-bootstrap';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';

import TagsInput from 'react-tagsinput'

import 'react-quill/dist/quill.snow.css';
import './ArticleForm.css' // If using WebPack and style-loader.
 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
Quill.register('modules/imageResize', ImageResize);

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

class ArticleForm extends React.Component {
    constructor(props) {
        super(props);
  
        this.modules = {
            toolbar: [
                [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                [{size: []}],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                [{'list': 'ordered'}, {'list': 'bullet'}, 
                {'indent': '-1'}, {'indent': '+1'}],
                ['link', 'image', 'video'],
                ['clean']
            ],
            clipboard: {
                // toggle to add extra line breaks when pasting HTML:
                matchVisual: false
            },
            // imageDrop: {}, // Make sure to add this!!!
            imageResize: {
                parchment: Quill.import('parchment')
            }
        };
        
        this.formats = [
            'header', 'font', 'size', 
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image', 'video', 'align',
        ];
        
        let article = this.props.article || {};
        this.state = {
            title: article.title || null,
            keywords: article.keywords || [],
            tags: article.tags || [],
            content: article.content || null,
            image: article.image || {filename: null, data: null},
        };
    }

    getForm() {
        let { title, keywords, tags, image } = this.state;
        return (  
            <Form>
                <Form.Row>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formArticleFormTitle'>
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type='text'
                                isValid={title != null && title != ''}
                                placeholder='Article Title'
                                value={title}
                                onChange={e => this.setState({title: e.target.value})}
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formArticleFormImage'>
                            <Form.Label>Image</Form.Label>
                            <Form.File 
                                id='form-add-article-image'
                                accept='image/*'
                                label={image.filename || "Headline image"}
                                onChange={e => {
                                    let file = e.target.files[0];
                                    toBase64(file).then(res => {
                                        this.setState({image: {data: res, filename: file.name}});
                                    }).catch(err => console.error(err));
                                }}
                                custom
                            />
                        </Form.Group>
                    </Col>
                </Form.Row>
                <Form.Row>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formArticleFormTitle'>
                            <Form.Label>Keywords</Form.Label>
                            <TagsInput 
                                className='form-control' 
                                inputProps={{placeholder: "Add keyword for searching"}} 
                                value={keywords} 
                                onChange={keywords => this.setState({keywords})} 
                            />
                        </Form.Group>
                    </Col>
                    <Col xs={12} md={6}>
                        <Form.Group controlId='formArticleFormTitle'>
                            <Form.Label>Tags</Form.Label>
                            <TagsInput className='form-control' value={tags} onChange={tags => this.setState({tags})} />
                        </Form.Group>
                    </Col>
                </Form.Row>
            </Form>
        );
    }

    submitArticle() {
        let { onSubmit }  = this.props;
        let { title, image, keywords, tags, content } = this.state;
        onSubmit({title, image, keywords, tags, content});
    }

    deleteArticle() {
        if (this.props.onDelete != null && window.confirm('Are you sure you want to delete this article?')) {
            this.props.onDelete();
        }
    }
    
    render() {
        let { onDelete, deleteText, submitText } = this.props;
        let { content } = this.state;
        
        let buttons;
        if (onDelete != null) {
            buttons = (
                <Row className="mt-3 no-gutter">
                    <Col xs={12} md={6} className='pr-1'>
                        <Button onClick={e => this.deleteArticle()} variant="outline-danger" block>    
                            <FontAwesomeIcon icon={faTrash} className='mr-2' />
                            {deleteText}
                        </Button>
                    </Col>
                    <Col xs={12} md={6} className='pl-1'>
                        <Button onClick={e => this.submitArticle()}  variant="outline-primary" block>{submitText}</Button>
                    </Col>
                </Row>
            );
        } else {
            buttons = (
                <Row className="mt-3">
                    <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                    <Col>
                        <Button onClick={e => this.submitArticle()} block>Submit</Button>
                    </Col>
                    <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                </Row>
            );
        }

        return (
            <Row className="mt-3">
                <Col>
                    <Row>
                        <Col>
                            {this.getForm()}
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <ReactQuill 
                                value={content}
                                modules={this.modules}
                                formats={this.formats}
                                onChange={content => this.setState({content: content})} 
                            />
                        </Col>
                    </Row>
                    {buttons}
                </Col>
            </Row>
        );
    }
};


ArticleForm.defaultProps = {
    submitText: 'Submit',
    deleteText: 'Delete',
};

export default ArticleForm;