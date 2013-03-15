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
  // @todo
})

// Read
app.get('/*', function(req, res){
  var katFilePath = req._parsedUrl.pathname
  console.log("GET: " + req.url)
  var katPath // @todo The item in the katFile to read
  var recursive // @todo Get everything below katPath
  fs.readFile(katFilePath, "utf8", function(err, katJson) {
    if (err) {
      res.send(err)
    }
    else {
      if(_.has(req, "query")) {
        if (_.has(req.query, "by_path") && _.has(req.query, "prune_topics")) {
          res.send(JSON.stringify(kat.flattenKatObjectByPath(JSON.parse(katJson), true)))
        }
        else if (_.has(req.query, "by_path")) {
          var katObject = JSON.parse(katJson)
          if(_.isObject(katObject)) {
            var flatKatObject = kat.flattenKatObjectByPath(katObject, false)
            res.send(JSON.stringify(flatKatObject))
          }
          else {
            res.send("Unable to parse JSON. May be invalid.")
          }
        }
        else {
          res.send(katJson)
        }
      }
    }

  })
})

// Update
app.put('/*', function(req, res){
  kat.addItemToKatFile(req.url, req.body, function(status) {
    res.send(status)
  })
})

// Delete
app.delete('/*', function(req, res){
  // @todo
})

app.listen(4200)
console.log('Listening on port 4200')



