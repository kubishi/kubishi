import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ImageResize from 'quill-image-resize-module-react';
import React from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TagsInput from 'react-tagsinput';
import './ArticleForm.css'; // If using WebPack and style-loader.
import { getTagLabel, getUpdates } from './helpers';
import ImageInput from './ImageInput';

var icon_h1 = `
<svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="h3" fill="currentColor">
            <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.42,8.63 C11.3266662,8.7033337 11.2283339,8.7133336 11.125,8.66 C11.0216661,8.6066664 10.97,8.5200006 10.97,8.4 L10.97,7.67 C10.97,7.2899981 11.1233318,6.9900011 11.43,6.77 L12.44,6.03 C12.7400015,5.8099989 13.0833314,5.7 13.47,5.7 L14.1,5.7 C14.2533341,5.7 14.3866661,5.7566661 14.5,5.87 C14.6133339,5.9833339 14.67,6.1166659 14.67,6.27 L14.67,12.43 C14.67,12.5833341 14.6133339,12.7166661 14.5,12.83 C14.3866661,12.9433339 14.2533341,13 14.1,13 L13.47,13 C13.3166659,13 13.1833339,12.9433339 13.07,12.83 C12.9566661,12.7166661 12.9,12.5833341 12.9,12.43 L12.9,7.57 L12.88,7.57 L11.42,8.63 Z" id="Shape" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>`;

var icon_h2 = `
<svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="h3" fill="currentColor">
            <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.35,13 C11.1966659,13 11.0633339,12.9433339 10.95,12.83 C10.8366661,12.7166661 10.78,12.5833341 10.78,12.43 L10.78,12.2 C10.78,11.8266648 10.9299985,11.5233345 11.23,11.29 C12.3500056,10.4099956 13.0916649,9.7400023 13.455,9.28 C13.8183351,8.8199977 14,8.3700022 14,7.93 C14,7.3166636 13.6600034,7.01 12.98,7.01 C12.5666646,7.01 12.060003,7.1233322 11.46,7.35 C11.3333327,7.3966669 11.2133339,7.3833337 11.1,7.31 C10.9866661,7.2366663 10.93,7.133334 10.93,7 L10.93,6.58 C10.93,6.4066658 10.9799995,6.25166735 11.08,6.115 C11.1800005,5.97833265 11.3133325,5.8866669 11.48,5.84 C12.0866697,5.6799992 12.6699972,5.6 13.23,5.6 C14.0366707,5.6 14.6583312,5.79166475 15.095,6.175 C15.5316688,6.55833525 15.75,7.0899966 15.75,7.77 C15.75,8.3566696 15.5650018,8.91499735 15.195,9.445 C14.8249981,9.97500265 14.1033387,10.6933288 13.03,11.6 C13.0233333,11.6066667 13.02,11.6133333 13.02,11.62 C13.02,11.6266667 13.0233333,11.63 13.03,11.63 L15.22,11.63 C15.3733341,11.63 15.5049995,11.6866661 15.615,11.8 C15.7250006,11.9133339 15.78,12.0466659 15.78,12.2 L15.78,12.43 C15.78,12.5833341 15.7250006,12.7166661 15.615,12.83 C15.5049995,12.9433339 15.3733341,13 15.22,13 L11.35,13 Z" id="Shape" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>`;

var icon_h3 = `
<svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="h3" fill="currentColor">
            <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.32,7.07 C11.1666659,7.07 11.0333339,7.0133339 10.92,6.9 C10.8066661,6.7866661 10.75,6.6533341 10.75,6.5 L10.75,6.27 C10.75,6.1166659 10.8066661,5.9833339 10.92,5.87 C11.0333339,5.7566661 11.1666659,5.7 11.32,5.7 L15.05,5.7 C15.2033341,5.7 15.3366661,5.7566661 15.45,5.87 C15.5633339,5.9833339 15.62,6.1166659 15.62,6.27 L15.62,6.5 C15.62,6.8800019 15.4733348,7.1899988 15.18,7.43 L13.67,8.68 L13.67,8.69 C13.67,8.6966667 13.6733333,8.7 13.68,8.7 L13.8,8.7 C14.3800029,8.7 14.8449983,8.8799982 15.195,9.24 C15.5450018,9.6000018 15.72,10.0866636 15.72,10.7 C15.72,11.4733372 15.4833357,12.0666646 15.01,12.48 C14.5366643,12.8933354 13.8566711,13.1 12.97,13.1 C12.436664,13.1 11.8966694,13.0366673 11.35,12.91 C11.1899992,12.8699998 11.0583339,12.7816674 10.955,12.645 C10.8516662,12.5083327 10.8,12.3533342 10.8,12.18 L10.8,11.84 C10.8,11.706666 10.8549995,11.6016671 10.965,11.525 C11.0750006,11.448333 11.196666,11.4299998 11.33,11.47 C11.9033362,11.6566676 12.4033312,11.75 12.83,11.75 C13.2166686,11.75 13.5166656,11.6600009 13.73,11.48 C13.9433344,11.2999991 14.05,11.0500016 14.05,10.73 C14.05,10.4033317 13.9266679,10.173334 13.68,10.04 C13.4333321,9.906666 12.9733367,9.8366667 12.3,9.83 C12.1466659,9.83 12.0133339,9.77500055 11.9,9.665 C11.7866661,9.55499945 11.73,9.4233341 11.73,9.27 L11.73,9.25 C11.73,8.8766648 11.8733319,8.5666679 12.16,8.32 L13.58,7.09 L13.58,7.08 C13.58,7.0733333 13.5766667,7.07 13.57,7.07 L11.32,7.07 Z" id="Shape" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>`;

var icon_h4 = `
<svg width="17px" height="12px" viewBox="0 0 17 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="h3" fill="currentColor">
            <path d="M1.992,12.728 C1.81066576,12.9093342 1.58966797,13 1.329,13 C1.06833203,13 0.84733424,12.9093342 0.666,12.728 C0.48466576,12.5466658 0.394,12.325668 0.394,12.065 L0.394,1.525 C0.394,1.26433203 0.48466576,1.04333424 0.666,0.862 C0.84733424,0.68066576 1.06833203,0.59 1.329,0.59 C1.58966797,0.59 1.81066576,0.68066576 1.992,0.862 C2.17333424,1.04333424 2.264,1.26433203 2.264,1.525 L2.264,5.503 C2.264,5.60500051 2.31499949,5.656 2.417,5.656 L7.381,5.656 C7.48300051,5.656 7.534,5.60500051 7.534,5.503 L7.534,1.525 C7.534,1.26433203 7.62466576,1.04333424 7.806,0.862 C7.98733424,0.68066576 8.20833203,0.59 8.469,0.59 C8.72966797,0.59 8.95066576,0.68066576 9.132,0.862 C9.31333424,1.04333424 9.404,1.26433203 9.404,1.525 L9.404,12.065 C9.404,12.325668 9.31333424,12.5466658 9.132,12.728 C8.95066576,12.9093342 8.72966797,13 8.469,13 C8.20833203,13 7.98733424,12.9093342 7.806,12.728 C7.62466576,12.5466658 7.534,12.325668 7.534,12.065 L7.534,7.271 C7.534,7.16899949 7.48300051,7.118 7.381,7.118 L2.417,7.118 C2.31499949,7.118 2.264,7.16899949 2.264,7.271 L2.264,12.065 C2.264,12.325668 2.17333424,12.5466658 1.992,12.728 Z M11.62,10.25 L11.62,10.26 C11.62,10.2666667 11.6233333,10.27 11.63,10.27 L13.28,10.27 C13.3400003,10.27 13.37,10.2433336 13.37,10.19 L13.37,7.77 C13.37,7.7633333 13.3666667,7.76 13.36,7.76 C13.3466666,7.76 13.34,7.7633333 13.34,7.77 L11.62,10.25 Z M10.68,11.6 C10.5266659,11.6 10.3950005,11.5433339 10.285,11.43 C10.1749995,11.3166661 10.12,11.1833341 10.12,11.03 L10.12,10.84 C10.12,10.4666648 10.2299989,10.1233349 10.45,9.81 L13.04,6.16 C13.2600011,5.8533318 13.5566648,5.7 13.93,5.7 L14.43,5.7 C14.5833341,5.7 14.7149994,5.7566661 14.825,5.87 C14.9350006,5.9833339 14.99,6.1166659 14.99,6.27 L14.99,10.19 C14.99,10.2433336 15.0199997,10.27 15.08,10.27 L15.48,10.27 C15.6333341,10.27 15.7666661,10.3266661 15.88,10.44 C15.9933339,10.5533339 16.05,10.6866659 16.05,10.84 L16.05,11.03 C16.05,11.1833341 15.9933339,11.3166661 15.88,11.43 C15.7666661,11.5433339 15.6333341,11.6 15.48,11.6 L15.08,11.6 C15.0199997,11.6 14.99,11.6299997 14.99,11.69 L14.99,12.43 C14.99,12.5833341 14.9350006,12.7166661 14.825,12.83 C14.7149994,12.9433339 14.5833341,13 14.43,13 L13.93,13 C13.7766659,13 13.6450005,12.9433339 13.535,12.83 C13.4249995,12.7166661 13.37,12.5833341 13.37,12.43 L13.37,11.69 C13.37,11.6299997 13.3400003,11.6 13.28,11.6 L10.68,11.6 Z" id="Shape" fill-rule="nonzero"></path>
        </g>
    </g>
</svg>`;

var icons = Quill.import('ui/icons'); icons.header[1]= icon_h1;
var icons = Quill.import('ui/icons'); icons.header[2]= icon_h2;
var icons = Quill.import('ui/icons'); icons.header[3]= icon_h3;
var icons = Quill.import('ui/icons'); icons.header[4]= icon_h4;

Quill.register('modules/imageResize', ImageResize);

class ArticleForm extends React.Component {
    constructor(props) {
        super(props);
  
        this.modules = {
            toolbar: [
                [{ 'header': '2'}, { 'header': '3' }, { 'header': '4' }, { 'font': [] }],
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
                <Button 
                    className='mt-2'
                    variant='outline-success' 
                    onClick={e => this.submitArticle()} 
                    block
                >
                    Submit
                </Button>
            );
        }

        let returnButton;
        if (article != null) {
            returnButton = (
                <Row className="mb-2">
                    <Col>
                        <Button 
                            block variant='outline-primary' 
                            href={`/articles/${article._id}`} 
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