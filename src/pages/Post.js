import React, { Component } from 'react';
import api from '../services/api';
import io from 'socket.io-client';

import './Post.css';

import more from '../assets/more.svg';
import like from '../assets/like.svg';
import commenting from '../assets/commenting.svg'
import send from '../assets/send.svg';
import liked from '../assets/liked.svg';

class Post extends Component {
    state = {
        post: null,
        likedPosts: [],
        comments: [],

        loading: false,
        comment_author: '',
        comment_comment: '',
    }

    async componentDidMount() {
        /**
         * This is cool, I think.
         * If there`s no data coming from a previous page (this.props.location.state) I get 
         * the data from the API.
         */
        if (typeof this.props.location.state !== 'undefined') {
            console.log("Data coming from another page.");
            this.setState({
                post: this.props.location.state.selectedPost,
                likedPosts: this.props.location.state.likedPosts,
            });
        } else {
            console.log("Data coming from API.");
            // Get posts from API
            const response = await api.get(`posts/${this.props.match.params.id}`);
            console.log(response);
            // Set post to post state.variable
            this.setState({ post: response.data.post[0] });
        }

        // Get comments from API using param from URL
        const postId = this.props.match.params.id;
        const response_comments = await api.get(`posts/${postId}/comments`);
        this.setState({ comments: 
            response_comments.data.comments,
        });

        // Register the page/module to the server.
        this.registerToSocket();
    }

    registerToSocket = () => {
        const socket = io(process.env.REACT_APP_API_ADDRESS);

        // Registering for new post (because I want to get the number of comments, actually)
        socket.on('post', newPost => {
            if (newPost._id === this.state.post._id) {
                this.setState({
                    post: newPost,
                });
            }
        });

        // Registering for new likes
        socket.on('like', likedPost => {
            if (likedPost._id === this.state.post._id) {
                this.setState({
                    post: likedPost,
                });
            }
        });

        // Registering for comments
        socket.on('comment', newComment => {
            if (newComment.post === this.state.post._id) {
                this.setState({
                    comments: [...this.state.comments, newComment],
                });
            }
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

    handleSubmit = async e => {
        e.preventDefault();
        this.setState({ loading: true });

        const data = new URLSearchParams();
        data.append('author', this.state.comment_author);
        data.append('comment', this.state.comment_comment);
        data.append('post', this.props.match.params.id);

        const config = {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }

        await api.post(`/posts/${this.state.post._id}/comment`, data, config)
            .then((result) => {
                this.setState({ loading: false });
            })
            .catch((error) => {
                this.setState({ loading: false});
            });

        this.setState({ 
            comment_author: '',
            comment_comment: '',
         });
    }

    handleChange = e => {
        this.setState({ [e.target.name]: e.target.value });
    }

    render() {
        const { loading } = this.state;
        if (this.state.post === null) {
            return(<h1>Loading...</h1>);
        } else {
            return(
                <section id="post-list">
                <article key={this.state.post._id}>
                    <header>
                        <div className="user-info">
                            <span>{this.state.post.author}</span>
                            <span className="place">{this.state.post.place}</span>
                        </div>
                        <img src={more} alt="More" />
                    </header>
                    
                    <img 
                        src={this.state.post.s3Url} 
                        alt={this.state.post.hashtags}
                    />
                    
                    <footer>
                        <div className="actions">
                            {this.state.likedPosts.includes(this.state.post._id) ? 
                                (
                                    <button type="button" onClick={() => this.handleLike(this.state.post._id)}>
                                        <img src={liked} alt="like" />
                                    </button>
                                ) : (
                                    <button type="button" onClick={() => this.handleLike(this.state.post._id)}>
                                        <img src={like} alt="like" />
                                    </button>
                                )
                            }
                            <img src={commenting} alt="comment" />
                            <img src={send} alt="send" />
                        </div>
                        
                        <strong>{this.state.post.likes} likes</strong>

                        <p>
                            {this.state.post.description}
                            <span>{this.state.post.hashtags}</span>
                        </p>
                    </footer>
                    <div className="comments">
                        <div className="comments-title">
                            <strong>{this.state.comments.length} comments</strong>
                        </div>
                            { this.state.comments.map(comment => (
                                <p key={comment._id}>
                                    <span><strong>{comment.author} </strong> {comment.comment}</span>
                                </p>
                            ))}

                        <form id="new-comment" onSubmit={this.handleSubmit}>
                            
                            <input 
                                required
                                type="text" 
                                name="comment_author"
                                placeholder="Author"
                                onChange={this.handleChange}
                                value={this.state.comment_author}
                            />

                            <input 
                                required
                                type="text" 
                                name="comment_comment"
                                placeholder="Comment"
                                onChange={this.handleChange}
                                value={this.state.comment_comment}
                            />

                            <button type="submit" disabled={loading}>
                                Comment
                            </button>
                        </form>
                    </div>
                </article>
            </section>
            );
        }
    }
}

export default Post;