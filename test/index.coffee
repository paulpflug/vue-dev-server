# out: index.js
casper.on "remote.message", (e) -> console.log e
casper.test.begin "vue-dev-server", 6, (test) ->
  casper.start "http://localhost:8080/"
  .then ->
    test.assertElementCount('ul', 1)
    test.assertElementCount('li', 2)
    test.assertTextExists("/test","found")
    test.assertTextExists("/test/test","found")
  .thenOpen "http://localhost:8080/#/test/test", ->
    test.assertTextExists("test3","found")
  .thenOpen "http://localhost:8080/#/test", ->
    test.assertTextExists("test2","found")
  .run ->
    test.done()
