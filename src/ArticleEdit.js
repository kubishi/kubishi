import React from 'react';

import { Row, Col, Button, Spinner } from 'react-bootstrap';

import api from './Api';
import history from './history';
import ArticleForm from './ArticleForm';

import 'react-quill/dist/quill.snow.css';

class ArticleEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {article: null};
    }
    
    componentDidMount() {
        let { articleId } = this.props;

        api.get(`/api/article/${articleId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                let { title, tags, keywords, content, image } = res.data.result;
                this.setState({ 
                    article: {
                        title: title, 
                        tags: tags, 
                        keywords: keywords, 
                        content: content, 
                        image: image
                    } 
                });
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    addArticle(article) {        
        if (article.title == null || article.content == null) {
            console.error('articles must havea title and content');
        }
    
        api.post('/api/article', article).then(res => {
            if (res.status == 200) {
                history.push(`/article/${res.data.result._id}`);
            } else {
                console.log(res.status, res.data);
            }
        }).catch(err => console.error(err));
    }

    deleteArticle() {
        let { articleId } = this.props;
        api.delete(`/api/article/${articleId}`).then(res => {
            if (res.status == 200 && res.data.success) {
                history.push('/');
                return history.go();
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
                onSubmit={article => this.addArticle(article)}
                onDelete={() => this.deleteArticle()}
                submitText='Save'
                article={article}
            />
        );
    }
};


export default ArticleEdit;