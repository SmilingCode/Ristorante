const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files'), false);
    } else {
        cb(null, true);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: imageFileFilter
});

const uploadRouter = express.Router();

uploadRouter.use(bodyParser.json());
/*** form upload
<form action="http://localhost:3000/imageUpload" enctype="multipart/form-data">
    <label htmlFor="file">filename:</label>
    <input type="file" id="imageFile" name="imageFile" />
    <input type="submit" name="submit" value="submit" />
</form>
*/

/*** ajax upload
var formData = new FormData();
formData.append("file", $("#imageFile")[0].files[0]);

$.ajax({
    url: http://localhost:3000/imageUpload,
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    success: function(res) {
        console.log(res);
        alert("123")
    }
});
 */
uploadRouter.route('/')
.get(cors.cors, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('GET operation is not supported on /imageUpload');
})
.post(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation is not supported on /imageUpload');
})
.delete(cors.corsWithOptions, authenticate.verifyOrdinaryUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('DELETE operation is not supported on /imageUpload');
})

module.exports = uploadRouter;
