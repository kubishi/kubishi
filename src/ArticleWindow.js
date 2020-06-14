
import React from 'react';
import { Row, Col, ListGroup, Form, Button, ButtonGroup, Spinner, Image } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

import api from './Api';
import Parser from 'html-react-parser';
import history from './history';
import qs from 'query-string';

import { getTagLabel } from './helpers';

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
        let { articleId } = this.props;

        api.get(`/api/articles/${articleId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                let { title, tags, keywords, content, image } = res.data.result;
                console.log({ title, tags, keywords, content, image });
                this.setState({ title, tags, keywords, content, image });
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    render() {
        let { canEdit, articleId } = this.props;
        let { title, tags, keywords, content, image } = this.state;

        if (content == null) return <Spinner />;

        let imageSquare;
        if (image != null && image.data != null) {
            imageSquare = <Image src={image.data} rounded style={{maxHeight: '30vh', maxWidth: '100%'}} />;
        }

        // let keywordsListItems = keywords.map((keyword, i) => {
        //     return <ListGroup.Item key={`keyword-${i}`}>{keyword}</ListGroup.Item>;
        // });
        let keywordsListItems = keywords.map((keyword, i) => {
            return (
                <a key={`keyword-${i}`} href='#' onClick={e => {
                    history.push({
                        pathname: '/search',
                        search: qs.stringify({query: keyword}),
                    });
                }}>
                    {keyword}
                </a>
            );
        }).reduce((acc, x) => {
            return acc === null ? x: <>{acc}, {x} </>;
        });
        let keywordsList = <p>{keywordsListItems}</p>;

        let tagsListItems = tags.map((tag, i) => {
            return (
                <a key={`tag-${i}`} href='#' onClick={e => {
                    history.push({
                        pathname: '/search',
                        search: qs.stringify({query: tag}),
                    });
                }}>
                    {getTagLabel(tag)}
                </a>
            );
        }).reduce((acc, x) => {
            return acc === null ? x: <>{acc}, {x} </>;
        });
        let tagsList = <p>{tagsListItems}</p>;

        let editButton;
        if (canEdit) {
            editButton = (
                <Button 
                    className="mb-2"
                    variant='outline-primary'
                    onClick={e => {
                        return history.push(`/articles/${articleId}?mode=edit`);
                    }}
                    block
                >
                    <FontAwesomeIcon icon={faEdit} className='mr-2' />
                    Edit
                </Button>
            );
        }
        
        return (
            <Row className="mt-2">
                <Col>
                    <div className='d-block d-md-none text-center'>
                        {editButton}
                    </div>
                    <h1>{title}</h1>
                    <div className='d-block d-md-none text-center'>
                        {imageSquare}
                    </div>
                    {Parser(content)}
                    <div className='d-block d-md-none text-center'>
                        <h5 className='mt-2'>Keywords</h5>
                        {keywordsList}
                        <h5 className='mt-2'>Tags</h5>
                        {tagsList}
                    </div>
                </Col>
                <Col className='d-none d-lg-block text-center' md={4}>
                    {editButton}
                    {imageSquare}
                    <h5 className='mt-2'>Keywords</h5>
                    {keywordsList}
                    <h5 className='mt-2'>Tags</h5>
                    {tagsList}
                </Col>
            </Row>
        );
    }
};

export default ArticleWindow;