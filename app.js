var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs')
var $ = require('jQuery')
var _ = require("underscore")
var jsonpatch = require("json-patch")
var kat = require("./kat.js")
var tests = require("./test/tests.js")

// For Express 3
app.use(express.bodyParser())

// Comment out if you don't want tests running on start
tests.run_tests()

/*
 * HTTP API
 */

// Create
app.post('/*', function(req, res){
  kat.addItemToKatFile(req.url, req.body, function(status) {
    res.send(status)
  })
})

// Read
app.get('/*', function(req, res){
  var katFilePath = req.url
  var katPath // @todo The item in the katFile to read
  var recursive // @todo Get everything below katPath
  fs.readFile(katFilePath, "utf8", function(err, katJson) {
    if (err) {
      res.send(err)
    }
    else {
      res.send(katJson)
    }

  })
})

// Update
app.put('/*', function(req, res){
  // @todo
})

// Delete
app.delete('/*', function(req, res){
  // @todo
})

app.listen(4200)
console.log('Listening on port 4200')



