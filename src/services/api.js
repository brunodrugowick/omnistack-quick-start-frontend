import axios from 'axios';

const api = axios.create({
    baseURL: 'https://omnistack-quick-start-backend.herokuapp.com',
});

export default api;