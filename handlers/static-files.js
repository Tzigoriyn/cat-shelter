const url = require('url');
const fs = require('fs');

function getContentType(url) {
    let conType = '';

    if (url.endsWith('css')) {
        conType = 'text/css';
    } else if (url.endsWith('png') || url.endsWith('jpg') || url.endsWith('jpeg') || url.endsWith('ico')) {
        if (`${url.split(/[#?]/)[0].split('.').pop().trim()}` === 'jpg') {
            conType = 'image/jpeg';
        } else {
            conType = `image/${url.split(/[#?]/)[0].split('.').pop().trim()}`;
        }
    }

    return conType;
}

function fileReadData(res, pathname) {
    return (err, data) => {
        if (err) {
            console.log(err);

            res.writeHead(404, {
                'Content-Type': 'text/plain'
            });

            res.write(('error was found'))
            res.end();
            return;
        }

        res.writeHead(200, {
            'Content-Type': getContentType(pathname)
        });

        res.write(data);
        res.end();
    }
}

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname.startsWith('/content') && req.method === 'GET') {
        if (getContentType(pathname) === 'text/css') {
            return fs.readFile(`./${pathname}`, 'utf-8', fileReadData(res, pathname));
        } else {
            return fs.readFile(`./${pathname}`, fileReadData(res, pathname));
        }
    } else {
        return true;
    }
};