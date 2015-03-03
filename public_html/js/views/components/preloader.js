define([
    'backbone'
], function(
    Backbone
){

    var View = Backbone.View.extend({

        el: '#preloader',

        show: function() {
            $(this.el).fadeIn();
        },

        hide: function() {
            $(this.el).fadeOut();
        }
    });

    return new View();
});
