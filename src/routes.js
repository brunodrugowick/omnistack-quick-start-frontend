import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Feed from './pages/Feed';
import New from './pages/New';
import Post from './pages/Post';

function Routes() {
    return (
        <Switch>
            <Route path="/" exact component={Feed} />
            <Route path="/new" exact component={New} />
            <Route path="/post/:id" exact component={Post} />
        </Switch>
    );
}

export default Routes;