
import React from 'react';
import { Col, Row, Spinner, Tabs, Tab } from 'react-bootstrap';
import Pagination from "react-js-pagination";
import api from './Api';
import ArticleList from './ArticleList';
import SearchBar from './SearchBar';
import './SearchWindow.css';
import SentenceList from './SentenceList';
import WordList from './WordList';

class SearchWindow extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            resultWords: null,
            totalWords: 0,
            pageWords: 1,

            resultArticles: null,
            totalArticles: 0,
            pageArticles: 1,

            resultSentences: null,
            totalSentences: 0,
            pageSentences: 1,

            selectedTab: this.props.defaultTab
        };
    }

    searchWords(pageWords=null) {
        let { query, resultsPerPage } = this.props;

        api.get('/api/search/words', 
            {
                params: { 
                    query: query, 
                    mode: 'fuzzy', 
                    fields: ['text', 'definition', 'part_of_speech'],
                    offset: ((pageWords || 1) - 1) * resultsPerPage,
                    limit: resultsPerPage,
                },
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({resultWords: [], totalWords: 0});
            } else if (res.data.result.length <= 0) {;
                this.setState({resultWords: [], totalWords: 0});
            } else {
                this.setState({resultWords: res.data.result, totalWords: res.data.total, pageWords: pageWords || 1});
            }
        }).catch(err => console.error(err));
    }
    
    searchSentences(pageSentences=null) {
        let { query, resultsPerPage } = this.props;
        let filterSentences = this.props.filterSentences || false;

        api.get('/api/search/sentences', 
            {
                params: { 
                    query: query, 
                    mode: 'fuzzy', 
                    fields: ['english', 'paiute'],
                    offset: ((pageSentences || 1) - 1) * resultsPerPage,
                    limit: resultsPerPage,
                    match: filterSentences ? JSON.stringify({paiuteTokens: {$exists: true}}) : null,
                },
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                console.log(res.status, res.data);
                this.setState({resultSentences: [], totalSentences: 0});
            } else if (res.data.result.length <= 0) {
                this.setState({resultSentences: [], totalSentences: 0});
            } else {
                this.setState({resultSentences: res.data.result, totalSentences: res.data.total, pageSentences: pageSentences || 1});
            }
        }).catch(err => console.error(err));
    }

    searchArticles(pageArticles) {
        let { query, resultsPerPage } = this.props;

        api.get('/api/search/articles', 
            {
                params: { 
                    query: query, 
                    mode: 'fuzzy', 
                    searchFields: ["title", "keywords", "tags"],
                    fields: ["title", "tags"],
                    offset: ((pageArticles || 1) - 1) * resultsPerPage,
                    limit: resultsPerPage,
                },
            }
        ).then(res => {
            if (res.status != 200 || !res.data.success) {
                this.setState({resultArticles: [], totalArticles: 0});
            } else if (res.data.result.length <= 0) {
                this.setState({resultArticles: [], totalArticles: 0});
            } else {
                this.setState({resultArticles: res.data.result, totalArticles: res.data.total, pageArticles: pageArticles || 1});
            }
        }).catch(err => console.error(err));
    }
    
    componentDidMount() {
        this.searchWords();
        this.searchSentences();
        this.searchArticles();
    }
    
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.query != this.props.query) {
            this.searchWords();
            this.searchSentences();
            this.searchArticles();
        }
    }

    render() {
        let { 
            resultWords, resultSentences, resultArticles,
            pageWords, pageSentences, pageArticles,
            totalWords, totalSentences, totalArticles,
            selectedTab
        } = this.state;

        let { resultsPerPage } = this.props;

        let contentArticles, paginateArticles;
        if (totalArticles > 0) {
            if (totalArticles > resultsPerPage) {
                paginateArticles = (
                    <div className="mt-2">
                        <Pagination
                            activePage={pageArticles}
                            itemsCountPerPage={resultsPerPage}
                            totalItemsCount={totalArticles}
                            pageRangeDisplayed={5}
                            onChange={pageNumber => this.searchArticles(pageNumber)}
                            innerClass="pagination justify-content-center"
                            itemClass="page-item"
                            linkClass="page-link"
                        />
                    </div>
                );
            }
            contentArticles = <ArticleList results={resultArticles} />;
        } else if (resultWords == null) {
            contentArticles= <Spinner />;
        } else {
            contentArticles = <span className='text-center'>No matching articles</span>;
        }
        let articleCol= (
            <Tab eventKey='articles' title='Articles' disabled={totalArticles <= 0}>
                {contentArticles}
                {paginateArticles}
            </Tab>
        );

        let contentWords, paginateWords;
        if (totalWords > 0) {
            if (totalWords > resultsPerPage){
                paginateWords = (
                    <div className="mt-2">
                        <Pagination
                            activePage={pageWords}
                            itemsCountPerPage={resultsPerPage}
                            totalItemsCount={totalWords}
                            pageRangeDisplayed={5}
                            onChange={pageNumber => this.searchWords(pageNumber)}
                            innerClass="pagination justify-content-center"
                            itemClass="page-item"
                            linkClass="page-link"
                        />
                    </div>
                );
            }
            contentWords = <WordList results={resultWords} />;
        } else if (resultWords == null) {
            contentWords = <Spinner />;
        } else {
            contentWords= <span className='text-center'>No matching words</span>;
        }
        let wordsCol= (
            <Tab eventKey='words' title='Words' disabled={totalWords <= 0}>
                {contentWords}
                {paginateWords}
            </Tab>
        );

        let contentSentences, paginateSentences;
        if (totalSentences > 0) {
            if (totalSentences > resultsPerPage) {
                paginateSentences = (
                    <div className="mt-2">
                        <Pagination
                            activePage={pageSentences}
                            itemsCountPerPage={resultsPerPage}
                            totalItemsCount={totalSentences}
                            pageRangeDisplayed={5}
                            onChange={pageNumber => this.searchSentences(pageNumber)}
                            innerClass="pagination justify-content-center"
                            itemClass="page-item"
                            linkClass="page-link"
                        />
                    </div>
                );
            }
            contentSentences = <SentenceList results={resultSentences} />;
        } else if (resultSentences == null) {
            contentSentences = <Spinner />;
        } else {
            contentSentences= <span className='text-center'>No matching sentences</span>;
        }
        
        let sentencesCol= (
            <Tab eventKey='sentences' title='Sentences' disabled={totalSentences <= 0}>
                {contentSentences}
                {paginateSentences}
            </Tab>
        );
        const defaultTab = selectedTab || (
            this.props.defaultTab || (totalWords > 0 ? "words" : (totalSentences > 0 ? "sentences" : (totalArticles > 0 ? "articles" : "words")))
        );

        return (
            <Row>
                <Col>
                    <SearchBar showRandomButtons className="mt-2" query={this.props.query} defaultTab={selectedTab}/>
                    <Tabs activeKey={defaultTab} onSelect={selectedTab => this.setState({ selectedTab })} >     
                        {wordsCol}
                        {sentencesCol}
                        {articleCol}
                    </Tabs>
                </Col>
            </Row>
        );
    }
};

SearchWindow.defaultProps = {
    resultsPerPage: 25,
};

export default SearchWindow;