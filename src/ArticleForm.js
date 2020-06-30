import React from 'react';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Editor } from '@tinymce/tinymce-react';
import { getTagLabel, getUpdates } from './helpers';
import { Form, Row, Col, Button } from 'react-bootstrap'; 
import ReactTagInput from "@pathofdev/react-tag-input";
import ImageInput from './ImageInput';
import "@pathofdev/react-tag-input/build/index.css";

const KeyCodes = {
    comma: 188,
    enter: 13,
};
  
const delimiters = [KeyCodes.comma, KeyCodes.enter];
  

class App extends React.Component {
    constructor(props) {
        super(props);
        const article = this.props.article || {};
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

    handleEditorChange = (e) => {
        this.setState({ content: e.target.getContent() });
    }

    render() {
        const { title, keywords, tags, content, image } = this.state;
        const { onDelete, deleteText, submitText, article } = this.props;
        
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

        const editor = (
            <Editor
                apiKey="09bwffcj2tw2eara7sdh8cm1o7ye05batdcz43vyx0iisgvp"
                initialValue={content}
                
                init={{
                    selector: 'textarea',
                    plugins: 'print preview paste importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap hr pagebreak nonbreaking anchor toc insertdatetime advlist lists wordcount imagetools textpattern noneditable help charmap quickbars emoticons',
                    imagetools_cors_hosts: ['picsum.photos'],
                    menubar: 'file edit view insert format tools table help',
                    toolbar: 'undo redo | bold italic underline strikethrough | fontselect fontsizeselect formatselect | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
                    toolbar_sticky: true,
                    image_advtab: true,
                    importcss_append: true,
                    
                    file_picker_callback: (cb, value, meta) => {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');

                        input.onchange = () => {
                            var file = this.files[0];
                            var reader = new FileReader();
                            reader.onload = function () {
                                var id = 'blobid' + (new Date()).getTime();
                                var blobCache =  window.tinymce.activeEditor.editorUpload.blobCache;
                                var base64 = reader.result.split(',')[1];
                                var blobInfo = blobCache.create(id, file, base64);
                                blobCache.add(blobInfo);
                        
                                /* call the callback and populate the Title field with the file name */
                                cb(blobInfo.blobUri(), { title: file.name });
                            };
                            reader.readAsDataURL(file);
                        };
                    
                        input.click();
                    },
                    templates: [
                        { title: 'New Table', description: 'creates a new table', content: '<div class="mceTmpl"><table width="98%%"  border="0" cellspacing="0" cellpadding="0"><tr><th scope="col"> </th><th scope="col"> </th></tr><tr><td> </td><td> </td></tr></table></div>' },
                    { title: 'Starting my story', description: 'A cure for writers block', content: 'Once upon a time...' },
                    { title: 'New list with dates', description: 'New List with dates', content: '<div class="mceTmpl"><span class="cdate">cdate</span><br /><span class="mdate">mdate</span><h2>My List</h2><ul><li></li><li></li></ul></div>' }
                    ],
                    template_cdate_format: '[Date Created (CDATE): %m/%d/%Y : %H:%M:%S]',
                    template_mdate_format: '[Date Modified (MDATE): %m/%d/%Y : %H:%M:%S]',
                    height: 600,
                    image_caption: true,
                    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
                    noneditable_noneditable_class: "mceNonEditable",
                    toolbar_mode: 'sliding',
                    contextmenu: "link image imagetools table",
                }}
                onChange={this.handleEditorChange}
            />
        );

        return (
            <div className='mt-2'>
                {returnButton}
                <Form>
                    <Form.Group controlId='formArticleFormTitle'>
                        <Form.Label>Title</Form.Label>
                        <Form.Control 
                            type='text'
                            isValid={title != null && title != ''}
                            placeholder='Article Title'
                            value={title}
                            onChange={e => this.setState({ title: e.target.value })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <ImageInput 
                            label='Main Image'
                            image={image}
                            onSave={image => this.setState({ image })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Keywords</Form.Label>
                        <ReactTagInput 
                            tags={keywords} 
                            placeholder="Type and press enter"
                            onChange={newKeywords => this.setState({ keywords: newKeywords })}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Tags</Form.Label>
                        <ReactTagInput 
                            tags={tags.map(tag => getTagLabel(tag))} 
                            placeholder="Type and press enter"
                            onChange={newTags => this.setState({tags: newTags.map(tag => `tag:${tag}`)})}
                        />
                    </Form.Group>
                    {editor}
                </Form>
                {buttons}
            </div>
        );
    }
}

export default App;