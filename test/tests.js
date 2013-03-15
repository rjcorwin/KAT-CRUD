// Tests for kat.js

var express = require('express')
var app = express()
var request = require('request')
var fs = require('fs')
var $ = require('jQuery')
var _ = require("underscore")
var jsonpatch = require("json-patch")
var kat = require("../kat.js")


module.exports = {



/*
 * Run tests
 */
run_tests : function() {

  this.test__kat_katPathDiff()
  this.test__kat_addItemToKatObject()
  this.test__kat_addItemToKatFile()
},



/*
 * TEST kat.katPathToJsonPath(path, object)
 */

test__kat_katPathDiff : function() {
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
    jsonPathBehind: "/children/0/children/1/children/2/",
    pathBehind: "/foo/bar/dan/",
    pathAhead: "/boing/"
  }

  var katPathDiff = kat.katPathDiff(path, object)

  if(katPathDiff.jsonPathBehind != shouldBe.jsonPathBehind) {
    console.log("TEST:fail -- katPathDiff.jsonPathBehind")
    console.log(katPathDiff.jsonPathBehind + " should be " + shouldBe.jsonPathBehind)
  }
  else {
    console.log("TEST:pass -- katPathDiff.jsonPathBehind")
  }
   
  if(katPathDiff.pathBehind != shouldBe.pathBehind) {
    console.log("TEST:fail -- katPathDiff.pathBehind")
    console.log(katPathDiff.pathBehind + " should be " + shouldBe.pathBehind)
  }
  else {
    console.log("TEST:pass -- katPathDiff.pathBehind")
  }

  if(katPathDiff.pathAhead != shouldBe.pathAhead) {
    console.log("TEST:fail -- katPathDiff.pathAhead")
    console.log(katPathDiff.pathAhead + " should be " + shouldBe.pathAhead)
  }
  else {
    console.log("TEST:pass -- katPathDiff.pathAhead")
  }

},



/*
 * TEST kat.addItemToKatObject(newItem, katObject, callback)
 */

test__kat_addItemToKatObject : function(verbose) {

  verbose = false

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

  shouldBe = {
    json: '{"path":"/","slug":"","children":[{"path":"/foo/","slug":"foo","children":[{},{"path":"/foo/bar/","slug":"bar","children":[{},{},{"path":"/foo/bar/dan/","slug":"dan","children":[{"_id":"boing","_rev":"1-3bd49daf4e794c77d070bf666e26728e","slug":"boing","path":"/foo/bar/dan/boing/","children":[{"path":"/foo/bar/dan/boing/test-item/","slug":"test-item"}]}]}]},{}]},{},{}]}'
  }


  // EXECUTE

  kat.addItemToKatObject(newItem, katObject, function(newKatObject) {
    // TEST
    //if(!_.has(newKatObject.children[0].children[1].children[2], "children")) {
    if(shouldBe.json != JSON.stringify(newKatObject)) {
      console.log("TEST:FAIL -- katPathDiff.addItemToKatObject -- newKatObject.children[0].children[1].children[2]:")
      console.log(JSON.stringify(newKatObject, null, 4))
      console.log("REASON: object should have a children property.")
    }
    else {
      console.log("TEST:PASS -- katPathDiff.addItemToKatObject")
      if(verbose == true) {
       console.log(JSON.stringify(newKatObject, null, 4))
      }
    }
  })


},



/*
 * TEST kat.addItemToKatFile(path, object)
 */

test__kat_addItemToKatFile : function() {
  var newItem = {
    "path":"/foo/bar/dan/boing/test-item/",
    "slug":"test-item"
  }

  var shouldBe = {
    json: '{"path":"/","slug":"","children":[{"path":"/foo/","slug":"foo","children":[{},{"path":"/foo/bar/","slug":"bar","children":[{},{},{"path":"/foo/bar/dan/","slug":"dan","children":[{"_id":"boing","_rev":"1-3bd49daf4e794c77d070bf666e26728e","slug":"boing","path":"/foo/bar/dan/boing/","children":[{"path":"/foo/bar/dan/boing/test-item/","slug":"test-item"}]}]}]},{}]},{},{}]}'
  }

  kat.addItemToKatFile("./test/testKatFile.json", newItem, function (katObject) {
    if (JSON.stringify(katObject) == shouldBe.json) {
      console.log("TEST:PASS -- kat.addItemToKatFile")
    }
    else {
      console.log("TEST:FAIL -- kat.addItemToKatFile")
    }
  })
},



} // end of module.exports
