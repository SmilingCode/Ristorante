const express = require('express');
const proxy = require('http-proxy-middleware');
const path = require('path');
const port = process.env.PORT || 7878;
const app = express();

// the __dirname is the current directory from where the script is running
app.use(express.static(path.join(__dirname, 'conFusion-React/build')));

app.use(
    '*',
    proxy({
        target: 'https://localhost:3443/',
        changeOrigin: true
    })
)

// send the user to index html page inspite of the url
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'conFusion-React/build/index.html'));
});

app.listen(port);
