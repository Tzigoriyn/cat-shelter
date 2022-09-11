const url = require('url');
const fs = require('fs');
const path = require('path');
const cats = require('../data/cats.json');


module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/' && req.method === 'GET') {
        let filePath = path.normalize(
            path.join(__filename, '../../views/home/index.html')
        );

        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.log(err);
                res.writeHead(err, {
                    'Content-Type': 'text/plain'
                });
                res.writeHead('404 file not found');
                res.end();
                return;
            }

            res.writeHead(200, {
                'Content-Type': 'text/html' ? 'text/html' : 'image/ico'
            });

            let modifiedCats = cats.map((cat) => `
            <li>
                <img src="${path.join('content/images/' + cat.image)}" alt="${cat.name}">
                <h3>${cat.name}</h3>
                <p><span>Breed: </span>${cat.breed}</p>
                <p><span>Description: </span>${cat.description}</p>
                <ul class="buttons">
                    <li class="btn edit"><a href="/cat-edit/${cat.id}">Change Info</a></li>
                    <li class="btn delete"><a href="/cat-find-new-home/${cat.id}">New Home</a></li>
                </ul>
            </li>`);

            let modifiedData = data.toString().replace('{{cats}}', modifiedCats)

            // res.write(data);
            res.write(modifiedData);
            res.end();
        });
    } else {
        return true;
    }

}

