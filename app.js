var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs-extra')
var $ = require('jQuery')
var _ = require("underscore")
// For Express 3
app.use(express.bodyParser())

app.post('/:path/:filename', function(req, res){
  fs.writeFile(req.params.path + '/' + req.params.filename, JSON.stringify(req.body, null, 4))
  res.send('success')
})
app.listen(3000)
console.log('Listening on port 3000')
