
import axios from 'axios';
import cookie from 'react-cookies';

const { REACT_APP_API_URL } = process.env;
const api = axios.create({
    baseURL: REACT_APP_API_URL,
});

api.interceptors.request.use(config => {
    let signed_request = cookie.load('signed_request');
    if (signed_request) {
        config.headers.signed_request = signed_request;
    }

    return config;
});

export default api;