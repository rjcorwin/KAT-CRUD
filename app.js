var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs')
var $ = require('jQuery')
var _ = require("underscore")
var jsonpatch = require("json-patch")
var tests = require("./test/tests.js")
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




/*
 *
 */
var kat = {


  // @todo I'm still thinking about the best way to handle this configuration...
  parentTree : {
    settings: {
      http: {
        root: "http://192.168.0.101:5984/library/",
        allItems: "_all_docs",
        byPath: "_design/owl/_view/by-path?key=",
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

  count: 1,

  /*
   * Recursive loop that builds the topic tree to a specific path destination
   */
  addItemToKatObject : function(newItem, katObject, callback) {
    
    this.count++

    // Find what will be the actual JSON path to the newItem, which may be an incomplete path
    var katPathDiff = kat.katPathDiff(newItem.path, katObject)

    // If there is road ahead, blaze the trail to the next cairn and call back into thyself with the result
    if(katPathDiff.pathAhead != "/") {

      var  nextItemURL = kat.parentTree.settings.http.root + 
        kat.parentTree.settings.http.byPath + 
        '"' + katPathDiff.pathBehind + katPathDiff.pathAhead.split('/')[1] + "/" + '"'
      console.log(nextItemURL)

      $.getJSON(nextItemURL, function(response) {
        if (response.rows.length > 0) {
          // We found something in the database to build out our path
          var item = response.rows[0].value
        }
        else {
          // We've reached the new item!
          var item = newItem
        }

        jsonpatch.apply(katObject, [{op: 'add', path: katPathDiff.jsonPathBehind + "children", value: [item]}]);

        kat.addItemToKatObject(newItem, katObject, callback)
        
      })

    }    
    else {
      // We've reached the end of the path, time to head home
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
    var jsonPathBehind = "/"
    var pathBehind = "/"
    $.each(map, function(slugOrder, slugKey){
      jsonPathBehind += "children/" + slugKey + "/"
      pathBehind += slugs[slugOrder] + "/"
    })

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
      jsonPathBehind: jsonPathBehind,
      pathBehind: pathBehind, 
      pathAhead: pathAhead
    }
  }

}


/*
 * Comment out if you don't want tests running on start
 */
tests.run_tests()

