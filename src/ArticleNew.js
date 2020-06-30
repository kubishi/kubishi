import React from 'react';
import api from './Api';
import ArticleForm from './ArticleForm';
import history from './history';

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
        return <ArticleForm onSubmit={article => this.addArticle(article)} user={this.props.user} />;
    }
};


export default ArticleNew;