onAfterAction = undefined
publicRoutes = undefined
@subs = new SubsManager
Router.configure
  layoutTemplate: 'masterLayout'
  loadingTemplate: 'loading'
  notFoundTemplate: 'notFound'
  routeControllerNameConverter: 'camelCase'
  onBeforeAction: ->
    if Config.username and Meteor.userId() and !Meteor.user().username
      @redirect '/setUserName'
    @next()
Router.waitOn ->
  subs.subscribe 'user'

onAfterAction = ->
  $bd = undefined
  if Meteor.isClient
    window.scrollTo 0, 0
    $bd = $('.modal-backdrop')
    $bd.removeClass 'in'
    return setTimeout((->
      $bd.remove()
    ), 300)
  return

Router.onAfterAction onAfterAction
publicRoutes = _.union(Config.publicRoutes or [], [
  'home'
  'atSignIn'
  'atSignUp'
  'atForgotPassword'
  'atSignOut'
])
Router.plugin 'ensureSignedIn', except: publicRoutes

Router.route 'analytics',
  path: AdminDashboard.path('analytics')
  controller: 'AdminController'
  onAfterAction: ->
    Session.set 'admin_title', 'Analytics'
    return