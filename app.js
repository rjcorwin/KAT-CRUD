var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs')
var $ = require('jQuery')
var _ = require("underscore")
var jsonpatch = require("json-patch")
// For Express 3
app.use(express.bodyParser())




/*
 * Settings
 */
var owlSettings = {
  library: "http://192.168.0.101:5984/library",
  dataFolder: "/Users/rj/Box/OWL/data"
}



/*
 * HTTP API
 */
app.post('/add-couch-doc-to-group/:groupId/:couchId', function(req, res){
  $.getJSON(owlSettings.library + "/" + req.params.couchId, function(couchDoc) {
    var katJsonFilePath = owlSettings.dataFolder + "/groups/" + groupId + "/topics"
    katJson.add(katJsonFilePath, couchDoc)
  })
  res.send('success')
})
app.listen(4200)
console.log('Listening on port 4200')




/*
 *
 */
var kat = {



  /* 
   * Add a new item to a KAT file.
   */
  add : function(katFilePath, newItem) {

    fs.readFile(katFilePath, "utf8", function(err, katJson) {
      
      var katObject = JSON.parse(katJson)
      
      // Find what will be the actual JSON path to the newItem
      var newItemJsonPath = kat.katPathToJsonPath(newItem.path, katObject)
      var newItemJsonPathArray = jsonPath.split("/")
      newItemJsonPathArray.pop()
      newItemJsonPathArray.shift()
      //console.log(jsonPathArray)

      var newItemKatPath = newItem.path
      var newItemKatPathArray = newItemKatPath.split("/")
      newItemKatPathArray.pop()
      newItemKatPathArray.shift()
      //console.log(newItemPathArray)

      if(newItemKatPathArray.length != (newItemJsonPathArray.length / 2)) {
        // Blaze the trail
        var pathAhead = resourcePathArray.shift((jsonPathArray.length / 2))
        var pathBehind = []
        katJson.rabbitHole(pathBehind, pathAhead, katObject, katFilePath)
      }
      else {
        // We can just add the object without blazing a trail
        katObject = jsonpatch.apply(JSON.stringify(katObject), [{op: 'add', path: jsonPath + "0", value: newItem}])
        fs.writeFile(owlSettings.dataFolder + "/groups/" + req.params.groupId + "/topics", JSON.stringify(topics, null, 4))
      }

    })
  },



  /*
   * Recursive loop that builds the topic tree to a specific path destination
   */
  rabbitHole : function(pathBehind, pathAhead, katObject, katFilePath) {
    $.getJSON(owlSettings.library + "/_design/owl/by-path?key=" + pathBehind, function(Doc) {

      // If there is road ahead, call back into thyself
      if(_.isArray(pathBehind.slice('/')))
        // pass one back
        pathAhead[] += pathBehind.pop()
        return kat.rabbitHole(pathBehind, pathAhead, katObject, katFilePath)
      }    
      else {
        // We've reached the end of the path
        fs.writeFile(katFilePath, JSON.stringify(katObject, null, 4))
      }
    })
  }



  /*
   * Translate a path attribute found in KA Lite Topics.json to the JSON path of that object
   */
  var katPathToJsonPath = function(path, topics) {
    // The slugs we'll be looking for
    var slugs = path.split("/")
    // Get rid of unneccessary blanks at end and beginning of array
    slugs.pop()
    slugs.shift()

    // The array places we find the corresponding slugs
    var map = []

    $.each(slugs, function(slugKey, slug) {
      if(_.has(topics, "children")) { 
        $.each(topics.children, function(mapKey, child) {
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

}






var test_kat_katPathToJsonPath = function() {
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

  var translatedPath = kat.katPathToJsonPath(path, object)

  if(translatedPath == shouldBe) {
    console.log("TEST: pass")
    console.log(translatedPath)
  }
  else {
    console.log("TEST:fail")
    console.log(translatedPath + " should be " + "/children/0/children/1/children/2/")
  }
}




