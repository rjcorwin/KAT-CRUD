
module.exports = {



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
  
  if(katPathDiff.pathBehind != shouldBe.pathBehind) {
    console.log("TEST:fail -- katPathDiff.pathBehind")
    console.log(katPathDiff.pathBehind + " should be " + shouldBe.pathBehind)
  }

  if(katPathDiff.pathAhead != shouldBe.pathAhead) {
    console.log("TEST:fail -- katPathDiff.pathAhead")
    console.log(katPathDiff.pathAhead + " should be " + shouldBe.pathAhead)
  }
},







/*
 * TEST kat.addItemToKatObject(newItem, katObject, callback)
 */

test__kat_addItemToKatObject : function() {


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
    else {
      console.log("TEST:PASS -- katPathDiff.addItemToKatObject")
    }
  })


},




/*
 * TEST kat.addItemToKatFile(path, object)
 */

test__kat_addItemToKatFile : function() {

},



run_tests : function() {

  /*
   * Run tests
   */
  //test__kat_katPathDiff()
  test__kat_addItemToKatObject()
  //test__kat_addItemToKatFile()
}

} // end of module.exports
