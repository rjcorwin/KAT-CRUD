var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs-extra')
var $ = require('jQuery')
var _ = require("underscore")
var jsonpatch = require("json-patch")
// For Express 3
app.use(express.bodyParser())

var library = "http://raspberrypi.local:5984"
var traildb = "/User/rj/Box/OWL/data"

app.post('/addCouchResourceToGroup/:groupId/:couchId', function(req, res){
  $.getJSON(library + "/library/" + req.params.couchId, function(resource) {
    
    var topics = fs.openFile(traildb + "/groups/" + req.params.groupId + "/topics")
    
    var jsonPath = translateKatPathToJsonPath(resource.path, topics)
    
    var jsonPathArray = jsonPath.split("/")
    jsonPathArray.pop()
    jsonPathArray.shift()

    var resourcePathArray = resource.path.split("/")
    resourcePathArray.pop()
    resourcePathArray.shift()

    var fillInTopicInfo = false
    if(resourcePathArray.count() != (jsonPathArray.count() / 2)) {
      fillInTopicInfo = true
      // Blaze the trail, fill in topic info later
      var pathAhead = resourcePathArray.shift((jsonPathArray.count() / 2))
      $.each(pathAhead, function(key, value) {
        jsonPath += "0/children/"
      })
    }

    jsonpath.apply(topics, [{op: 'add', path: jsonPath + "0", value: resource}])

    fs.writeFile(traildb + "/groups/" + req.params.groupId + "/topics", JSON.stringify(topics, null, 4))
    if(fillInTopicInfo == true) {
      fixTopicInfo(req.params.groupId, jsonPath)
    }

  })
  res.send('success')
})
app.listen(4200)
console.log('Listening on port 4200')

var fixTopicInfo = function (groupId, jsonPath) {
  // @todo
}

/*
 * Translate a path attribute found in KA Lite Topics.json to the JSON path of that object
 */
var translateKatPathToJsonPath = function(path, object) {
  // The slugs we'll be looking for
  var slugs = path.split("/")
  // Get rid of unneccessary blanks at end and beginning of array
  slugs.pop()
  slugs.shift()

  // The array places we find the corresponding slugs
  var map = []

  $.each(slugs, function(slugKey, slug) {
    if(object.hasOwnProperty("children")) { 
      $.each(object.children, function(mapKey, child) {
        if(child.slug == slug){
          map[slugKey] = mapKey
          object = child
        }
      })
    }
  })

  // construct the translated path
  var translatedPath = "/"
  $.each(map, function(slugOrder, slugKey){
    translatedPath += "children/" + slugKey + "/"
  })

  return translatedPath 
}


var test_translateKatPathToJsonPath = function() {
  var object={
    "path":"/",
    "slug":"",
    "children": [
      {
        "path":"/foo",
        "slug":"foo",
        "children": [
          { },
          {
            "path":"/foo/bar",
            "slug":"bar",
            "children": [
              { },
              { },
              {
                "path":"/foo/bar/dan", 
                "slug":"dan",
              }
            ]
          },
          { }
        ]
      },
      { },
      { },
    ]
  }

  // The object path we'll be searching for plus something at the end to try and trip up the process
  var path="/foo/bar/dan/boing/"
  var shouldBe = "/children/0/children/1/children/2/"

  var translatedPath = translateKatPathToJsonPath(path, object)

  if(translatedPath == shouldBe) {
    console.log("TEST: pass")
    console.log(translatedPath)
  }
  else {
    console.log("TEST:fail")
    console.log(translatedPath + " should be " + "/children/0/children/1/children/2/")
  }
}




