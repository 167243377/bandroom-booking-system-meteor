Router.map(function () {

  this.route("home", {
    path: "/",
    layoutTemplate: "homeLayout"
  });

  Router.route('analytics', {
    path: AdminDashboard.path('analytics'),
    controller: 'AdminController',
    onAfterAction: function () {
      Session.set('admin_title', 'Analytics');
    }
  });

});