/* global Package */
Package.describe({
    name: 'socialize:commentable',
    summary: 'A package for implementing social commenting',
    version: '2.0.0',
    git: 'https://github.com/copleykj/socialize-commentable.git',
});

Package.onUse(function _(api) {
    api.versionsFrom(['2.8.1', '3.0']);

    api.use([
        'aldeed:simple-schema@2.0.0 || 3.0.0',
        'socialize:likeable@2.0.0',
        'reywood:publish-composite@1.8.9'
    ]);

    api.imply('socialize:likeable');

    api.mainModule('server/server.js', 'server');
    api.mainModule('common/common.js', 'client');
});
