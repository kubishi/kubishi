import React from 'react';
import { Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../Api';
import ArticleForm from './ArticleForm';
import history from '../common/history';

class ArticleEdit extends React.Component {
    constructor(props) {
        super(props);

        this.state = {article: null};
    }
    
    popToast(message, isError=false) {
        let toastFun = isError ? toast.error : toast.success;
        return toastFun(message, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            className: isError ? 'bg-danger' : 'bg-success'
        });
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

        api.put(`/api/articles/${article._id}`, new_article).then(res => {
            if (res.status == 200) {
                this.popToast('Successfully updated article!');
                this.getArticle();
            } else {
                console.log(res.status, res.data);
                this.popToast('Error updating article!', true);
            }
        }).catch(err => {
            this.popToast('Error updating article!', true);
            console.error(err);
        });
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
        return [
            <ToastContainer />,
            <ArticleForm
                onSubmit={article => this.saveArticle(article)}
                onDelete={() => this.deleteArticle()}
                user={this.props.user}
                submitText='Save'
                article={article}
            />
        ];
    }
};


export default ArticleEdit;