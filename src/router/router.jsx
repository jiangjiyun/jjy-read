import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';

import { browserHistory } from 'react-router';

import Main from '../components/Main/index';
import SearchPage from '../components/search/index';
import DetailPage from '../components/detail/index';
import ReadPage from '../components/read/index';


const RouteConfig = () => (
  <Router history={browserHistory}>
    <Switch>
      <Route path="/" exact component={Main} />
      <Route path="/search" exact component={SearchPage} />
      <Route path="/detail/:id" exact component={DetailPage} />
      <Route path="/read/:id" exact component={ReadPage} />
    </Switch>
  </Router>
)


export default RouteConfig