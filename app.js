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
var katBackend = {
  library: "http://192.168.0.101:5984/library",
}



/*
 * HTTP API
 */

// Create
app.post('/', function(req, res){
  // @todo
})

// Read
app.get('/', function(req, res){
  // @todo
})

// Update
app.put('/', function(req, res){
  kat.addItemToKatFile(req.param.katFilePath, req.body)
  res.send('success')
})

// Delete
app.delete('/', function(req, res){
  // @todo
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
  addItemToKatFile : function(katFilePath, newItem, returnKatObject = false) {

    fs.readFile(katFilePath, "utf8", function(err, katJson) {
      
      var katObject = JSON.parse(katJson)
      
      kat.addItemToKatObject(newItem, katObject, function (newKatObject){
        fs.writeFile(katFilePath, JSON.stringify(newKatObject, null, 4))
        if (returnKatObject == true) {
          return newKatObject
        }
      })

    })
  },



  /*
   * Recursive loop that builds the topic tree to a specific path destination
   */
  addItemToKatObject : function(newItem, katObject, callBack) {

    // Find what will be the actual JSON path to the newItem, which may be an incomplete path
    var katPathDiff = kat.katPathDiff(newItem.path, katObject).split("/")

    // If there is road ahead, blaze the trail to the next cairn and call back into thyself with the result
    if(_.isArray(katPathDiff.pathBehind.slice('/'))) {

      $.getJSON(katBackend..library + "/_design/owl/by-path?key=" + katPathDiff.pathBehind, function(Doc) {

        katObject.children.push(Doc)
        kat.addItemToKatObject(newItem, katObject, function(newKatObject) {
          // Send the new Object down the recursive rabbit whole
          return newKatObject
        })
        
      })

    }    
    else {
      // We've reached the end of the path
      katObject.children.push(Doc)
      callBack(katObject)
    }
  },



  /*
   * Translate a path attribute found in KA Lite Topics.json to the JSON path of that object
   */
  katPathDiff : function(fullPath, katObject) {
    // The slugs we'll be looking for
    var slugs = fullPath.split("/").pop().shift()
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

    // @todo get pathAhead
    var pathAhead
    return { 
      fullPath: fullPath,
      jsonPath: jsonPath,
      pathBehind: pathBehind, 
      pathAhead: pathAhead
    }
  }

}



/*
 * TEST kat.katPathToJsonPath(path, object)
 */
var test__kat_katPathDiff = function() {
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

  var katPathDiff = kat.katPathDiff(path, object)

  if(katPathDiff.jsonPath != shouldBe.jsonPath) {
    console.log("TEST:fail -- katPathDiff.jsonPath")
    console.log(katPathDiff.jsonPath + " should be " + shouldBe.jsonPath)
  }
  
  if(katPathDiff.pathBehind != shouldBe.pathBehind) {
    console.log("TEST:fail -- katPathDiff.pathBehind")
    console.log(katPathDiff.pathBehind + " should be " + shouldBe.pathBehind)
  }

  if(katPathDiff.pathAhead != shouldBe.pathAhead) {
    console.log("TEST:fail -- katPathDiff.pathAhead")
    console.log(katPathDiff.pathAhead + " should be " + shouldBe.pathAhead)
  }
}

var test__kat_addItemToKatObject = function() {

}

var test__kat_addItemToKatFile = function() {

}

/*
 * Run tests
 */
test__kat_katPathDiff()
test__kat_addItemToKatObject()
test__kat_addItemToKatFile()

