'use strinct';

// RequireJS config
var require = {
    baseUrl: './scripts',
    paths: {
        jquery: 'http://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min',
        'jQuery.UI': 'http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min'
    },
    shim: {
        'jQuery.UI': ['jquery']
    }
};

