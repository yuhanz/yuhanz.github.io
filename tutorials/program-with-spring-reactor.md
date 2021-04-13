## Spring Reactive Programming

You controller method can respond a `Publisher<ResponseEntity<ByteArray>>` object to serve a result in Reactive framework.

```
@RequestMapping(path = [
    "/api/demo/v1/",
], method = [RequestMethod.GET])
fun demoResource(@PathVariable("resource") resource: String,
               @RequestParam parameters: MultiValueMap<String, String>,
               @RequestHeader headers: MultiValueMap<String, String>): Publisher<ResponseEntity<ByteArray>> {
```

Convert a constant to Mono
```
  val myResult = "hello"
  val myMono = Mono.just(myResult)
```

Handles exceptions that happened inside a Mono:

```
  myMono.onErrorResult {
    var retVal: Mono<ResponseEntity<ByteArray>>? = null
    if(it is IllegalArgumentException) {
      retVal = Mono.just(HttpStatus.BAD_REQUEST)
    }
    // ...
    retVal
  }
```

To transform Mono
```
  myMono.map {
    it
  }
```

To close connection after a process is done
```
  val connection: StatefulRedisConnection<String, String> = // ... get a connection.
  myMono
    .map {
      //... your logic here
    }
    .doFinally { connection.closeAsync()}
```

To allow a null value wrapped in Mono
```
  var retVal = null
  Mono.justOrEmpty(retVal)
```

To handle like the case when a mono has null value (like handing if-else)
```
  myMono.switchIfEmpty(Mono.defer {
      // lazily construct your mono here.
    })
```

To run your mono on a different thread, (especially when blocking operation is involved):
```
  myMono.subscribeOn(Schedulers.boundedElastics())
```

To trigger something asynchronously but we don't care about its result:
```
  myNewMongo.map {
    ...
  }.subscribe()
```
