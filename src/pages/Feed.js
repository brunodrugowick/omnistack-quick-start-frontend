import React, { Component } from 'react';
import api from '../services/api';
import io from 'socket.io-client';

import './Feed.css';

import more from '../assets/more.svg';
import like from '../assets/like.svg';
import comment from '../assets/comment.svg'
import send from '../assets/send.svg';
import liked from '../assets/liked.svg';


class Feed extends Component {
    state = {
        feed: [],
        likedPosts: [],
    };

    async componentDidMount() {
        // Register the page/module to the server.
        this.registerToSocket();
        // Get posts from API
        const response = await api.get('posts');
        // Set posts to feed state.variable
        this.setState({ feed: response.data.posts });
    }

    registerToSocket = () => {
        const socket = io(process.env.REACT_APP_API_ADDRESS);

        socket.on('post', newPost => {
            // Creates a new feed with the newPost and reorder based on createdAt property.
            var newFeed = this.state.feed;
            newFeed.push(newPost);
            newFeed.sort((a, b) => { return (b.createdAt > a.createdAt) ? 1 : -1})
            // Sets the state.feed to the newFeed
            this.setState({ feed: newFeed });

            // If it wasn't for the first post I want to keep, we could add at the first position like so:
            //this.setState({ feed: [newPost, ...this.state.feed] });
        });

        socket.on('like', likedPost => {
            this.setState({
                feed: this.state.feed.map(post =>
                    post._id === likedPost._id ? likedPost : post
                )
            });
        });
    }

    handleLike = id => {
        api.post(`/posts/${id}/like`);
        this.paintLike(id);
    }

    paintLike = id => {
        if (!this.state.likedPosts.includes(id)) {
            this.setState({ likedPosts: [id, ...this.state.likedPosts] });
        }
    }

    render() {
        return (
            <section id="post-list">
                { this.state.feed.map(post => (
                    <article key={post._id}>
                    <header>
                        <div className="user-info">
                            <span>{post.author}</span>
                            <span className="place">{post.place}</span>
                        </div>
                        <img src={more} alt="More" />
                    </header>
                    
                    {typeof post.imageBinary === 'undefined' ? (
                        <img 
                            src={`${process.env.REACT_APP_API_ADDRESS}/files/${post.image}`} 
                            alt={`( using static image ) ${post.description}`}
                        />
                    ) : (
                        <img 
                            src={`data:image/jpeg;base64,${btoa(String.fromCharCode.apply(null, post.imageBinary.data.data))}`} 
                            alt={`( using binary image from database ) ${post.description}`}
                        />
                    )

                    }

                    <footer>
                        <div className="actions">
                            {this.state.likedPosts.includes(post._id) ? 
                                (
                                    <button type="button" onClick={() => this.handleLike(post._id)}>
                                        <img src={liked} alt="like" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => this.handleLike(post._id)}>
                                        <img src={like} alt="like" />
                                    </button>
                                )
                            }
                            <img src={comment} alt="comment" />
                            <img src={send} alt="send" />
                        </div>
                        
                        <strong>{post.likes} curtidas</strong>

                        <p>
                            {post.description}
                            <span>{post.hashtags}</span>
                        </p>
                    </footer>                    
                </article>
                ))}
            </section>
        );
    }
}

export default Feed;