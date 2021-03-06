var onAfterAction, publicRoutes;

onAfterAction = void 0;

publicRoutes = void 0;

var subs = new SubsManager();

Router.configure({
  layoutTemplate: 'masterLayout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  routeControllerNameConverter: 'camelCase',
  onBeforeAction: function () {
    if (Config.username && Meteor.userId() && !Meteor.user().username) {
      this.redirect('/setUserName');
    }
    return this.next();
  }
});

Router.waitOn(function () {
  return subs.subscribe('user');
});

onAfterAction = function () {
  var $bd;
  $bd = void 0;
  if (Meteor.isClient) {
    window.scrollTo(0, 0);
    $bd = $('.modal-backdrop');
    $bd.removeClass('in');
    return setTimeout((function () {
      return $bd.remove();
    }), 300);
  }
};

Router.onAfterAction(onAfterAction);

publicRoutes = _.union(Config.publicRoutes || [], ['home', 'atSignIn', 'atSignUp', 'atForgotPassword', 'atSignOut']);

Router.plugin('ensureSignedIn', {
  except: publicRoutes
});

// Router.route('analytics', {
//   path: AdminDashboard.path('analytics'),
//   onAfterAction: function () {
//     Session.set('admin_title', 'Analytics');
//   }
// });

// AdminController = RouteController.extend({
//   template: 'hello',

//   waitOn: function () {

//   },

//   data: function () {}
// });