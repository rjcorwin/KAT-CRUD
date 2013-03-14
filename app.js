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
var katParent = {
  byPath: "http://192.168.0.101:5984/library/_design/owl/by-path?key=",
}



/*
 * HTTP API
 */

// Create
app.post('/', function(req, res){
  kat.addItemToKatFile(req.param.katFilePath, req.body, function(status) {
    res.send(status)
  })
})

// Read
app.get('/', function(req, res){
  // @todo
  var katOriginPath // Could be over HTTP, could be a file
  var katPath // The item in the katFile to read
  var recursive // Get everything below katPath?
})

// Update
app.put('/', function(req, res){
  // @todo
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



  parentTree : {
    settings: {
      http: {
        root: "http://192.168.0.101:5984/library/",
        allItems: "_all_docs",
        byPath: "_design/by-path?key=",
        type: "CouchDB"
      },
      file: {
        //filePath:"test/test.json"
      }
    },
    getItemByPath : function(path, callback) {
      if (this.settings.http.type == "CouchDB") {
        // @todo Wondering if this is a good direction...
      }
    }
  },




  /* 
   * Add a new item to a KAT file.
   */
  addItemToKatFile : function(katFilePath, newItem, callback) {

    fs.readFile(katFilePath, "utf8", function(err, katJson) {
      
      var katObject = JSON.parse(katJson)
      
      kat.addItemToKatObject(newItem, katObject, function (newKatObject){
        fs.writeFile(katFilePath, JSON.stringify(newKatObject, null, 4))
        if (returnKatObject == true) {
          if (callback && typeof(callback) === "function") {
            callback(newKatObject)
          }
        }
      })

    })
  },



  /*
   * Recursive loop that builds the topic tree to a specific path destination
   */
  addItemToKatObject : function(newItem, katObject, callback) {

    // Find what will be the actual JSON path to the newItem, which may be an incomplete path
    var katPathDiff = kat.katPathDiff(newItem.path, katObject)
    console.log("katPathDiff:")
    console.log(katPathDiff)

    // If there is road ahead, blaze the trail to the next cairn and call back into thyself with the result
    if(_.isArray(katPathDiff.pathBehind.slice('/'))) {

      $.getJSON(kat.parentTree.http.root + kat.parentTree.http.byPath + katPathDiff.pathBehind, function(Doc) {

        katObject.children.push(Doc)
        kat.addItemToKatObject(newItem, katObject, function(newKatObject) {
          // Send the new Object down the recursive rabbit whole
          return newKatObject
        })
        
      })

    }    
    else {
      // We've reached the end of the path
      katObject.children.push(newItem)
      if (callback && typeof(callback) === "function") {
        callback(katObject)
      }
    }
  },



  /*
   * Translate a path attribute found in KA Lite Topics.json to the JSON path of that object
   */
  katPathDiff : function(fullPath, katObject) {
    // The slugs we'll be looking for
    var slugs = fullPath.split("/")
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
    var slugsAhead = slugs
    var i = 0
    while(i < map.length) {
      slugsAhead.shift()
      i++
    }
    var pathAhead = "/"
    $.each(slugsAhead, function (slugKey, slug) {
      pathAhead += slug + "/"
    })

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



/*
 * TEST kat.addItemToKatObject(newItem, katObject, callback)
 */

var test__kat_addItemToKatObject = function() {




  // SETUP

  var katObject = {
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

  var newItem = {
    "path":"/foo/bar/dan/boing/test-item/",
    "slug":"test-item"
  }




  // EXECUTE

  kat.addItemToKatObject(newItem, katObject, function(newKatObject) {
    // TEST
    if(!_.has(newKatObject.children[0].children[1].children[2], "children")) {
      console.log("TEST:FAIL -- katPathDiff.addItemToKatObject -- newKatObject.children[0].children[1].children[2]:")
      console.log(newKatObject.children[0].children[1].children[2])
      console.log("REASON: object should have a children property.")
    }
  })






}

var test__kat_addItemToKatFile = function() {

}

/*
 * Run tests
 */
test__kat_katPathDiff()
test__kat_addItemToKatObject()
//test__kat_addItemToKatFile()

