define([
    'app'
], function(
    app
){

    var Notify = Backbone.View.extend({

        initialize: function () {
            this.listenTo(app.notify, 'notify', this.showMessage);
        },

        showMessage: function(message, status) {
            $.notify(message, {
                position: 'bottom',
                className: status
            });
        }
    });

    return Notify;
});
