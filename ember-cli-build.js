/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var Funnel = require('broccoli-funnel');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    // Add options here
    // minifyJS: {
    //   enabled: true
    // },
    fingerprint: {
      prepend: 'http://supramolecular.org.s3.amazonaws.com/'
    },
    outputPaths: {
        app: {
          css: {
            'app': '/assets/bindfit-client.css',
            'print': '/assets/print.css'
          }
        }
    }
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  // Merge site stylesheet provided inside app to dist/assets
  // See here: 
  // http://www.ember-cli.com/managing-dependencies/#using-broccoli-funnel
  var extraAssets = new Funnel('app/assets', {
     srcDir: '/',
     include: ['**/site.css', '**/print.css'],
     destDir: '/assets'
  });
  
  return app.toTree(extraAssets);
};
