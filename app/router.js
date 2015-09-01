import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
    location: config.locationType,
    rootURL: '/bindfit/'
});

Router.map(function() {
    this.route('view', {path: '/view/:id'});
});

export default Router;
