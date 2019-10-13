const http = require('http');
const fs = require('fs');
const path = require('path');
const hostname = 'localhost';
const port = '5000';

const server = http.createServer((req, res) => {
    console.log('Request for ' + req.url + ' by method ' + req.method);

    if (req.method == 'GET') {
        var fileUrl;
        if (req.url == '/') {
            fileUrl = '/index.html'
        } else {
            fileUrl = req.url;
        }

        var filePath = path.resolve('./conFusion-React/build' + fileUrl);
        const fileExt = path.extname(filePath);
        var contentType = 'text/html';

        switch(fileExt) {
            case '.js':
                contentType = 'text/javascript';
                break;
            case '.css':
                contentType = 'text/css';
                break;
            case '.json':
                contentType = 'application/json';
                break;
            case '.png':
                contentType = 'image/png';
                break;
            case '.jpg':
                contentType = 'image/jpg';
                break;
            case '.wav':
                contentType = 'audio/wav';
                break;
        }

        fs.readFile(filePath, function (err, content) {
            if (err) {
                if(err.code == 'ENOENT'){
                    fs.readFile('./404.html', function(err, content) {
                        res.writeHead(200, { 'Content-Type': contentType });
                        res.end(content, 'utf-8');
                    });
                }
            } else {
                //console.log('filePath: ', filePath);
                // Website you wish to allow to connect
                res.setHeader('Access-Control-Allow-Origin', '*');

                // Request methods you wish to allow
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

                // Request headers you wish to allow
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

                // Set to true if you need the website to include cookies in the requests sent
                // to the API (e.g. in case you use sessions)
                res.setHeader('Access-Control-Allow-Credentials', true);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        })
        // if (fileExt == '.html') {
        //     fs.exists(filePath, (exists) => {
        //         if (!exists) {
        //             res.statusCode = 404;
        //             res.setHeader('Content-Type', 'text/html');
        //             res.end('<html><body><h1>Error 404: ' + fileUrl + ' is not found</h1></body></html>')

        //             return;
        //         }
        //         console.log('filePath: ', filePath)
        //         res.statusCode = 200;
        //         res.setHeader('Content-Type', 'text/html');
        //         fs.createReadStream(filePath).pipe(res);
        //     })
        // } else {
        //     res.statusCode = 404;
        //     res.setHeader('Content-Type', 'text/html');
        //     res.end('<html><body><h1>Error 404: ' + fileUrl + ' is not a HTML file</h1></body></html>')

        //     return;
        // }
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html');
        res.end('<html><body><h1>Error 404: ' + req.method + ' is not supported</h1></body></html>')

        return;
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});
