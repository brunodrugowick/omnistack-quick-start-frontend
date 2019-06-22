import React, { Component } from 'react';
import api from '../services/api';
import './New.css';

class New extends Component {
    state = {
        image: null,
        author: '',
        place: '',
        description: '',
        hashtags: '',
        loading: false,
    };

    handleSubmit = async e => {
        e.preventDefault();
        this.setState({ loading: true });

        const data = new FormData();
        data.append('image', this.state.image);
        data.append('author', this.state.author);
        data.append('place', this.state.place);
        data.append('description', this.state.description);
        data.append('hashtags', this.state.hashtags);
        
        await api.post('posts', data).then(() => {
            this.setState({ loading: false });
        });

        this.props.history.push('/');
    }

    handleImageChange = e => {
        this.setState({ image: e.target.files[0] });
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        const { loading } = this.state;
        return (
            <form id="new-post" onSubmit={this.handleSubmit}>
                <input 
                    required
                    type="file" 
                    onChange={this.handleImageChange}
                />

                <input 
                    required
                    type="text" 
                    name="author"
                    placeholder="Author"
                    onChange={this.handleChange}
                    value={this.state.author}
                />

                <input 
                    required
                    type="text" 
                    name="place"
                    placeholder="Local"
                    onChange={this.handleChange}
                    value={this.state.place}
                />

                <input 
                    required
                    type="text" 
                    name="description"
                    placeholder="Description"
                    onChange={this.handleChange}
                    value={this.state.description}
                />

                <input 
                    type="text" 
                    name="hashtags"
                    placeholder="Hashtags"
                    onChange={this.handleChange}
                    value={this.state.hashtags}
                />

                <button type="submit" disabled={loading}>
                    Share
                </button>
            </form>
        );
    }
}

export default New;