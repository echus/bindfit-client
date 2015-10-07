import Ember from 'ember';

export default Ember.Object.extend({
    data: null,
    fit:  null,

    reset: function() {
        this.set('data', null);
        this.set('fit', null);
    },

    isPopulated: Ember.computed('data', 'fit', function() {
        return (this.get('data') && this.get('fit'));
    })
});
