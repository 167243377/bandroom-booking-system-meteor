module.exports = {
  servers: {
    one: {
      // TODO: set host address, username, and authentication method
      host: '138.197.41.172',
      username: 'root',
      // pem: './path/to/pem'
      password: '167243377'
      // or neither for authenticate from ssh-agent
    }
  },

  meteor: {
    // TODO: change app name and path
    name: 'bandroom-booking',
    path: '../../bandroom-booking-system-meteor',

    servers: {
      one: {},
    },

    buildOptions: {
      serverOnly: false,
    },

    env: {
      // TODO: Change to your app's url
      // If you are using ssl, it needs to start with https://
      ROOT_URL: 'http://bandroom-booking.com',
      MONGO_URL: 'mongodb://admin:admin@ds157040.mlab.com:57040/band-room-booking-system',
    },

    // ssl: { // (optional)
    //   // Enables let's encrypt (optional)
    //   autogenerate: {
    //     email: 'email.address@domain.com',
    //     // comma seperated list of domains
    //     domains: 'website.com,www.website.com'
    //   }
    // },

    docker: {
      // change to 'kadirahq/meteord' if your app is not using Meteor 1.4
      image: 'abernix/meteord:base',
      imagePort: 80, // (default: 80, some images EXPOSE different ports)
    },

    // This is the maximum time in seconds it will wait
    // for your app to start
    // Add 30 seconds if the server has 512mb of ram
    // And 30 more if you have binary npm dependencies.
    deployCheckWaitTime: 60,

    // Show progress bar while uploading bundle to server
    // You might need to disable it on CI servers
    enableUploadProgressBar: true
  },

  // mongo: {
  //   port: 27017,
  //   version: '3.4.1',
  //   servers: {
  //     one: {}
  //   }
  // }
};
