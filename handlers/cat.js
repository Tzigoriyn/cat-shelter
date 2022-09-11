const url = require('url');
const fs = require('fs');
const path = require('path');
const query = require('node:querystring');
const formidable = require('formidable');
const mv = require('mv');
const breeds = require('../data/breeds.json');
const cats = require('../data/cats.json');

module.exports = (req, res) => {
    const pathname = url.parse(req.url).pathname;

    if (pathname === '/cats/add-cat' && req.method === 'GET') {
        let filePath = path.normalize(path.join(__filename, '../../views/addCat.html'));

        const index = fs.createReadStream(filePath);

        index.on('data', (data) => {
            let catBrredPlaceholder = breeds.map((breed) => `<option value="${breed}">${breed}</option>`);
            let modifiedData = data.toString().replace('{{catBreeds}}', catBrredPlaceholder);

            res.write(modifiedData);
        });

        index.on('end', () => {
            res.end();
        });

        index.on('error', (err) => {
            console.log(err);
        });
    } else if (pathname === '/cats/add-breed' && req.method === 'GET') {
        let filePath = path.normalize(path.join(__filename, '../../views/addBreed.html'));

        const index = fs.createReadStream(filePath);

        index.on('data', (data) => {
            res.write(data);
        });

        index.on('end', () => {
            res.end();
        });

        index.on('error', (err) => {
            console.log(err);
        });
    } else if (pathname === '/cats/add-breed' && req.method === 'POST') {
        let formData = '';

        req.on('data', (data) => {
            formData += data;
        });

        req.on('end', () => {
            let body = query.parse(formData);

            fs.readFile('./data/breeds.json', (err, data) => {
                if (err) {
                    throw err;
                }

                let breeds = JSON.parse(data);
                breeds.push(body.breed);
                let json = JSON.stringify(breeds);

                fs.writeFile('./data/breeds.json', json, 'utf-8', () => {
                    console.log('The breed was uploaded seccessfully');
                });

                res.writeHead(302, { location: '/' });
                res.end();
            });
        });
    } else if (pathname === '/cats/add-cat' && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) throw err;

            let oldPath = files.upload.filepath;

            let newPath = path.normalize(path.join(__dirname, '../content/images/' + files.upload.originalFilename));

            mv(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Files was upload unseccessfully');
            });

            fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
                if (err) throw err;

                let allCats = JSON.parse(data);
                allCats.push({ id: cats.length + 1, ...fields, image: files.upload.originalFilename });

                let json = JSON.stringify(allCats);

                fs.writeFile('./data/cats.json', json, () => {
                    res.writeHead(302, { location: '/' });
                    res.end();
                });
            });
        });
    } else if ((pathname.includes('/cat-edit') || pathname.includes('/cat-find-new-home')) && req.method === 'GET') {
        let filePath = '';
        if (pathname.includes('/cat-edit')) {
            filePath = path.normalize(path.join(__filename, '../../views/editCat.html'));
        } else {
            filePath = path.normalize(path.join(__filename, '../../views/catShelter.html'));
        }

        const catId = pathname.substring(pathname.lastIndexOf('/') + 1);
        const index = fs.createReadStream(filePath);

        index.on('data', (data) => {
            let currentCat = cats.find(cat => cat.id == catId);
            let modifiedData = data.toString().replace('{{id}}', catId);

            modifiedData = modifiedData.replace('{{name}}', currentCat.name);
            modifiedData = modifiedData.replace('{{image}}', `../../${path.join('content/images/' + currentCat.image)}`);

            modifiedData = modifiedData.replace('{{description}}', currentCat.description);

            const breedsAsOption = breeds.map(b => `<option value="${b}">${b}</option>`);
            modifiedData = modifiedData.replace('{{catBreeds}}', breedsAsOption.join('/'));

            modifiedData = modifiedData.replace('{{breed}}', currentCat.breed);

            res.write(modifiedData);
        });

        index.on('end', () => {
            res.end();
        });

        index.on('error', (err) => {
            console.log(err);
        });
    } else if (pathname.includes('/cat-edit') && req.method === 'POST') {
        let form = new formidable.IncomingForm();

        form.parse(req, (err, fields, files) => {
            if (err) throw err;

            let oldPath = files.upload.filepath;

            let newPath = path.normalize(path.join(__dirname, '../content/images/' + files.upload.originalFilename));

            mv(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log('Files was upload unseccessfully');
            });

            fs.readFile('./data/cats.json', 'utf-8', (err, data) => {
                if (err) throw err;

                const catId = pathname.substring(pathname.lastIndexOf('/') + 1);
                let allCats = JSON.parse(data)
                    .allCats.filter(cat => cat.id != catId);

                allCats.push({ id: catId, ...fields, image: files.upload.originalFilename });

                let json = JSON.stringify(allCats);

                fs.writeFile('./data/cats.json', json, 'utf8', () => {
                    res.writeHead(302, { location: '/' });
                    res.end();
                });
            });
        });
    } else if (pathname.includes('/cat-find-new-home') && req.method === 'POST') {
        fs.readFile('./data/cats.json', 'utf8', (err, data) => {
            if (err) {
                throw err;
            };

            const catId = pathname.split('/').pop();
            let allCats = JSON.parse(data)
                .filter(cat => cat.id != catId);

            const json = JSON.stringify(allCats);

            fs.writeFile('./data/cats.json', json, (err) => {
                if (err) {
                    throw err;
                };
                console.log(`Cat ID:${catId} successfully adopted!`);
            })
        });
        res.writeHead(301, { 'location': '/' });
        res.end();
    } else {
        return true;
    }
}
