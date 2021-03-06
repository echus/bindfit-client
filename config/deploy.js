/* jshint node: true */

module.exports = {
    production: {
        store: {
            type: 'ssh',
            remoteDir: '/var/www/bindfit_client/',
            host: '52.63.104.201',
            username: 'webadmin',
            privateKeyFile: process.env.SSH_KEY_FILE,
        },
        assets: {
            type: 's3',
            accessKeyId: process.env.AWS_KEY,
            secretAccessKey: process.env.AWS_SECRET,
            bucket: 'supramolecular.org',
            region: 'ap-southeast-2',
        },
    },
    development: {
        // Add a development configuration here, similar to the production one above
    },
};
