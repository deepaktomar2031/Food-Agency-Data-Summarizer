const express = require('express');

module.exports = (ratingController) => {
    const DEFAULT_PORT = 8000;
    const app = express();
    init();

    async function run() {
        init();
        app.listen(DEFAULT_PORT, () => {
            console.log(`Server listening on http://localhost:${DEFAULT_PORT} ...`);
            console.log('Both the website and the app API are served on this URL');
        });
    }

    function init() {
        app.use(express.static('public'));

        app.get('/', (req, res) => {
            return res.send();
        });

        app.get('/api', (req, res) => {
            return ratingController.getAuthorities(req, res);
        })

        app.get('/api/:authorityId', (req, res) => {
            return ratingController.getAuthority(req, res);
        });
    }

    return {
        run,
    };
};
