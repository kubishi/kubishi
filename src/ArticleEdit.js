import React from 'react';

import { Row, Col, Button, Spinner } from 'react-bootstrap';

import api from './Api';
import history from './history';
import ArticleForm from './ArticleForm';
import { getUpdates } from './helpers';

import 'react-quill/dist/quill.snow.css';

class ArticleEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {article: null};
    }
    
    componentDidMount() {
        this.getArticle()
    }

    getArticle() {
        let { articleId } = this.props;

        api.get(`/api/articles/${articleId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                this.setState({article: res.data.result});
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    saveArticle(new_article) {      
        let { article } = this.state;
        if (article == null) return; // article not loaded yet

        if (new_article.title == null || new_article.content == null) {
            console.error('articles must havea title and content');
        }

        let body = getUpdates(article, new_article);
        if (!body) return; // no updates
        api.put(`/api/articles/${article._id}`, body).then(res => {
            if (res.status == 200) {
                this.getArticle();
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    deleteArticle() {
        let { articleId } = this.props;
        api.delete(`/api/articles/${articleId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                return history.push('/');
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }
    
    render() {
        let { article } = this.state;
        if (article == null) return <Spinner />;
        return (
            <ArticleForm
                onSubmit={article => this.saveArticle(article)}
                onDelete={() => this.deleteArticle()}
                submitText='Save'
                article={article}
            />
        );
    }
};


export default ArticleEdit;