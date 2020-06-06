import React from 'react';

import { Row, Col, Button, Table } from 'react-bootstrap';

import api from './Api';
import history from './history';
import ArticleForm from './ArticleForm';

import 'react-quill/dist/quill.snow.css';

class ArticleNew extends React.Component {
    constructor(props) {
        super(props);
    }

    addArticle(article) {        
        if (article.title == null || article.content == null) {
          console.error('articles must havea title and content');
        }
    
        api.post('/api/articles', article).then(res => {
          if (res.status == 200) {
            history.push(`/articles/${res.data.result._id}`);
          } else {
            console.log(res.status, res.data);
          }
        }).catch(err => console.error(err));
    }
    
    render() {
        return <ArticleForm onSubmit={article => this.addArticle(article)} />;
    }
};


export default ArticleNew;