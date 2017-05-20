Router.map ->
  @route "home",
    path: "/"
    layoutTemplate: "homeLayout"

  @route "dashboard",
    path: "/dashboard"
    waitOn: ->
      [
        Meteor.subscribe 'attachments'

        subs.subscribe 'attachments'
   
        subs.subscribe 'posts'
        subs.subscribe 'comments'

        #booking system related items
        subs.subscribe 'reservations'
        subs.subscribe 'customers'

        subs.subscribe 'centers'
        subs.subscribe 'rooms'
        subs.subscribe 'districts'
        subs.subscribe 'roomTypes'
        subs.subscribe 'roomStatus'

      ]
    data: ->
      posts: Posts.find({},{sort: {createdAt: -1}}).fetch()