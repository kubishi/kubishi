
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Parser from 'html-react-parser';
import qs from 'query-string';
import React from 'react';
import { Button, Col, Image, Row, Spinner } from 'react-bootstrap';
import api from './Api';
import { getTagLabel } from './helpers';
import SearchBar from './SearchBar';
import ShareButtons from './ShareButtons';

class ArticleWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: null,
            tags: [],
            keywords: [],
            content: null,
            image: null
        }
    }

    componentDidMount() {
        this.getArticle();
    }

    getArticle() {
        let { articleId } = this.props;

        api.get(`/api/articles/${articleId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                let { title, tags, keywords, content, image } = res.data.result;
                this.setState({ title, tags, keywords, content, image });
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (this.props.articleId !== prevProps.articleId) { 
            this.getArticle();      
        }
    }

    render() {
        let { canEdit, articleId } = this.props;
        let { title, tags, keywords, content, image } = this.state;

        if (content == null) return <Spinner />;

        let imageSquare;
        if (image != null && image.data != null) {
            imageSquare = <Image src={image.data} rounded style={{maxHeight: '30vh', maxWidth: '100%'}} />;
        }

        let keywordsList;
        if (keywords.length > 0) {
            let keywordsListItems = keywords.map((keyword, i) => {
                console.log(qs.stringify({query: keyword}))
                return (
                    <a key={`keyword-${i}`} href={`/search?${qs.stringify({query: keyword})}`}>
                        {keyword}
                    </a>
                );
            }).reduce((acc, x) => {
                return acc === null ? x: <>{acc}, {x} </>;
            });
            keywordsList = [
                <h4 className='mt-2'>Keywords</h4>,
                <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />,
                <p>{keywordsListItems}</p>,
            ];
        }

        let tagsList;
        if (tags.length > 0) {
            let tagsListItems = tags.map((tag, i) => {
                return (
                    <a key={`tag-${i}`} href={`/search?${qs.stringify({query: tag})}`}>
                        {getTagLabel(tag)}
                    </a>
                );
            }).reduce((acc, x) => {
                return acc === null ? x: <>{acc}, {x} </>;
            })
            tagsList = [
                <h4 className='mt-2'>Tags</h4>,
                <hr style={{margin: "0px", padding: "0px", paddingBottom: "5px"}} />,
                <p>{tagsListItems}</p>,
            ];
        }
        
        let quote = `Check out this article on Kubishi, "${title}"!`;
        let shareButtons = <ShareButtons title={title} quote={quote} url={`https://kubishi.com/articles/${articleId}`} />;

        let editButton;
        if (canEdit) {
            editButton = (
                <Button 
                    className="mb-2"
                    variant='outline-primary'
                    href={`/articles/${articleId}?mode=edit`}
                    block
                >
                    <FontAwesomeIcon icon={faEdit} className='mr-2' />
                    Edit
                </Button>
            );
        }
        
        return [
            <Row className='mt-2'>
                <Col>
                    <SearchBar showRandomButtons />
                </Col>
            </Row>,
            <Row className="mt-2">
                <Col>
                    <div className='d-block d-lg-none text-center'>
                        {editButton}
                    </div>
                    <h1>{title}</h1>
                    <div className='d-block d-lg-none text-center'>
                        {imageSquare}
                    </div>
                    {Parser(content)}
                    <div className='d-block d-lg-none text-center'>
                        {keywordsList}
                        {tagsList}
                        {shareButtons}
                    </div>
                </Col>
                <Col className='d-none d-lg-block text-center' md={4}>
                    {editButton}
                    {imageSquare}
                    {keywordsList}
                    {tagsList}
                    {shareButtons}
                </Col>
            </Row>
        ];
    }
};

export default ArticleWindow;