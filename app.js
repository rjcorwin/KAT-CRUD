var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs-extra')
var $ = require('jQuery')
var _ = require("underscore")
// For Express 3
app.use(express.bodyParser())

var library = "http://raspberrypi.local:5984"
var traildb = "/User/rj/Box/OWL/data"

app.post('/addCouchResourceToGroup/:groupId/:couchId', function(req, res){
  $.getJSON(library + "/library/" + req.params.couchId, function(resource) {
    var topics = fs.openFile(traildb + "/groups/" + req.params.groupId + "/topics")
    // Build the path
    var map = resource.path.split("/")
    var breadcrumb = ""
    var trail =& topics
    $.each(map, function(key, cairn) {
      breadcrumb += cairn + "/"
      // Assume we're going to have to blaze the trail unless later proven wrong
      var blazeTrail = true
      var cairnLocation = null
      $.each(trail.children, function(key, child) {
        if(child.path == breadcrumb) {
          cairnLocation = key
        }
      })
      if (cairnLocation === null) {
        // blaze the trail
        if(!_.hasProperty(trail, "children"))
          trail.children = []
        trail.children 

      }


      trail =& 

    })
    fs.writeFile(traildb + "/groups/" + req.params.groupId + "/topics", JSON.stringify(topics, null, 4))

  })
  res.send('success')
})
app.listen(4200)
console.log('Listening on port 4200')
