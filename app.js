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
    var katJsonFilePath = owlSettings.dataFolder + "/groups/" + req.params.groupId + "/topics"
    kat.add(katJsonFilePath, couchDoc)
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

    console.log("newItem:")
    console.log(newItem)

    fs.readFile(katFilePath, "utf8", function(err, katJson) {
      
      var katObject = JSON.parse(katJson)
      console.log("katObject:")
      console.log(katObject)
      
      // Find what will be the actual JSON path to the newItem, which may be an incomplete path
      var katPathInfo = kat.katPathInfo(newItem.path, katObject).split("/")
      jsonPath.pop()
      jsonPath.shift()
      console.log("newItemJsonPathArray:")
      console.log(jsonPath)

      var katPath = newItem.path.split("/")
      katPath.pop()
      katPath.shift()
      console.log("katPath:")
      console.log(katPath)

      if(katPath.length != (jsonPath.length / 2)) {
        // Blaze the trail
        var pathAhead = katPath.shift((jsonPath.length / 2))
        console.log("pathAhead:")
        console.log(pathAhead)
        var pathBehind = []
        kat.rabbitHole(pathBehind, pathAhead, katObject, katFilePath)
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
      if(_.isArray(pathBehind.slice('/'))) {
        // pass one back
        //pathAhead[] += pathBehind.pop()
        return kat.rabbitHole(pathBehind, pathAhead, katObject, katFilePath)
      }    
      else {
        // We've reached the end of the path
        fs.writeFile(katFilePath, JSON.stringify(katObject, null, 4))
      }
    })
  },



  /*
   * Translate a path attribute found in KA Lite Topics.json to the JSON path of that object
   */
  katPathInfo : function(path, katObject) {
    // The slugs we'll be looking for
    var slugs = path.split("/")
    // Get rid of unneccessary blanks at end and beginning of array
    slugs.pop()
    slugs.shift()

    // The array index we find the corresponding slugs
    var map = []

    $.each(slugs, function(slugKey, slug) {
      if(_.has(katObject, "children")) { 
        $.each(katObject.children, function(mapKey, child) {
          if(child.slug == slug){
            map[slugKey] = mapKey
            katObject = child
          }
        })
      }
    })

    // construct the translated path
    var jsonPath = "/"
    var pathBehind = "/"
    $.each(map, function(slugOrder, slugKey){
      jsonPath += "children/" + slugKey + "/"
      pathBehind += slugs[slugOrder] + "/"
    })

    return { 
      jsonPath: jsonPath,
      pathBehind: pathBehind 
    }
  }

}



/*
 * TEST kat.katPathToJsonPath(path, object)
 */
var test_kat_katPathInfo = function() {
  var object={
    "path":"/",
    "slug":"",
    "children": [
      {                                  // 0
        "path":"/foo/",
        "slug":"foo",
        "children": [
          { },
          {                              //1
            "path":"/foo/bar/",
            "slug":"bar",
            "children": [
              { },
              { },
              {                          //2
                "path":"/foo/bar/dan/", 
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
  var shouldBe = {
    jsonPath: "/children/0/children/1/children/2/",
    pathBehind: "/foo/bar/dan/",
    pathAhead: "/boing/"
  }

  var katPathInfo = kat.katPathInfo(path, object)

  if(katPathInfo.jsonPath != shouldBe.jsonPath) {
    console.log("TEST:fail -- katPathInfo.jsonPath")
    console.log(katPathInfo.jsonPath + " should be " + shouldBe.jsonPath)
  }
  
  if(katPathInfo.pathBehind != shouldBe.pathBehind) {
    console.log("TEST:fail -- katPathInfo.pathBehind")
    console.log(katPathInfo.pathBehind + " should be " + shouldBe.pathBehind)
  }

  if(katPathInfo.pathAhead != shouldBe.pathAhead) {
    console.log("TEST:fail -- katPathInfo.pathAhead")
    console.log(katPathInfo.pathAhead + " should be " + shouldBe.pathAhead)
  }
}


/*
 * Run tests
 */
test_kat_katPathInfo()

