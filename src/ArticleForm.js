import React from 'react';

import { Form, Row, Col, Button } from 'react-bootstrap';
import ReactQuill, { Quill } from 'react-quill';
import ImageResize from 'quill-image-resize-module-react';

import TagsInput from 'react-tagsinput'

import 'react-quill/dist/quill.snow.css';
import './ArticleForm.css' // If using WebPack and style-loader.
 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { toBase64, getUpdates, getTagLabel } from './helpers';
import ImageInput from './ImageInput';
import history from './history';

Quill.register('modules/imageResize', ImageResize);

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

    hasChanged() {
        let old_article = this.props.article;
        if (old_article == null) return true;

        return Object.keys(getUpdates(old_article, this.state)).length > 0;
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
                        <ImageInput 
                            image={image}
                            onSave={image => this.setState({image})}
                        />
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
                            <TagsInput 
                                className='form-control' 
                                value={tags.map(tag => getTagLabel(tag))} 
                                onChange={tags => this.setState({tags: tags.map(tag => `tag:${tag}`)})}
                            />
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
        let { article } = this.props;
        
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
                        <Button 
                            onClick={e => this.submitArticle()} 
                            variant="outline-success" 
                            block
                            disabled={!this.hasChanged()}
                            href='#'
                        >
                            {submitText}
                        </Button>
                    </Col>
                </Row>
            );
        } else {
            buttons = (
                <Row className="mt-3">
                    <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                    <Col>
                        <Button variant='outline-success' onClick={e => this.submitArticle()} block>Submit</Button>
                    </Col>
                    <Col className='d-none d-md-block d-xl-block' md={3}></Col>
                </Row>
            );
        }

        let returnButton;
        if (article != null) {
            returnButton = (
                <Row className="mb-2">
                    <Col>
                        <Button 
                            block variant='outline-primary' 
                            href='#' 
                            onClick={e => history.push(`/article/${article._id}`)}
                        >
                            Back to Article
                        </Button>
                    </Col>
                </Row>
            );
        }

        return (
            <Row className="mt-3">
                <Col>
                    {returnButton}
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