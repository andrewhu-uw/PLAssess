# PLAssess

Backend for the PLAssess project

## Build Process

### Folder layout

```
PLAssess
├─src
| └─test
├─dist
└─priv
  └─firestore-private-key.json
```

`src` is where your source code goes, `dist` is where transpiled code goes

#### Security

You have to generate a new private key from `Firebase Console->PLAssess->
Settings->Service Accounts`

I do not think this is the best way to do it, I need to put more time
into understanding Firebase/Firestore auth. For now, this is what
you have to do, though

### Typescript

Typescript is transpiled into Javascript, and the compiler settings are all in the `tsconfig.json`. When you want to compile your source, just run

```
tsc -p tsconfig.json
```

In the top-level directory

## Testing

### Installing Mocha & Chai

We test the transpiled javascript using Mocha & Chai. I originally installed these globally like so

```
npm install -g mocha chai 
```

But, I now have them installed locally and just alias mocha to "node_modules/mocha/bin/mocha", so that I can install typescript and ts-node locally.

### Running Tests

`npm` should have added `mocha` to your path, so you should now be able to run tests with 

`mocha dist/test-name`

With VS Code you should be able to run the task `test`.

Based on [this post](https://medium.com/spektrakel-blog/debugging-typescript-from-vscode-3cb3a182bf63),
I edited `launch.json`, so you should now be able to use `ts-node` debugging in VS Code

#### Running Tests in Typescript!

I added the `ts-node` dependency, which means that if you change the testing call,
you can test the Typescript without even compiling it.

```
mocha -r ts-node/register src/test*.ts
```

I timed it on the CS Lab Linux machines, and compiling to JavaScript and running
mocha on plain JS took 11.3s total, but running mocha with ts-node on the TS
took 9.5s

#### When Tests Fail

Be careful about counting which tests fail. If a beforeAll hook fails, it doesn't run the entire suite, so it only
looks like one test failed, when the entire suite failed.

### Writing Tests

You can look at the Mocha and Chai documentation, but there are a couple tricky things to remember.


If you want to check that two objects are structurally equivalent, i.e. that each property
has the same value, then you want to use the `expect(blah).to.deep.equal(bleh)` method

If you have a test that uses promises, you want to first, write the test as a function that takes 
in a "done" function as a parameter, which can be called after the promise is resolved

```typescript
it ("Should do...", (done) => {
//     done function ^^^^
  myPromiseFunc().then((result) => {
    // do stuff with the result
    
    // call done() to signal that the tests has completed
    done();
  }).catch( (err) => {
    // call done(err) if an error is thrown
    done(err);
  });
})
```

### Asynchronous Tests

Probably one of the trickiest things about writing these tests is working with promises. [This article](https://wietse.loves.engineering/testing-promises-with-mocha-90df8b7d2e35) comes to a pretty good conclusion in my opinion that making the test function itself `async` and using `await` on promises is the best solution.

I am very new to Promises and asynchronous IO in general, and I found [this article](https://blog.domenic.me/youre-missing-the-point-of-promises/) to be very helpful

## Architecture

### Firebase Connection

The connection to the firebase DB is controlled by the DB module in DB.ts

`DB.init()` must be called before any transactions with the database can be made.
After that, objects can be loaded from the database with the `DB.get*()` functions and
any class that implements the `FirestoreSync` interface can be used to send updates
 to the database.

## JS Refresher

### `null` vs `undefined`

When a property has not been used before it is `undefined`. Null is loosely equal to `undefined`, AKA `undefined == null`.
However, they are not strictly equal, AKA `undefined === null`.

What the heck is `null` then? You can assign a value to be `null`, but I mean you can also assign a value to be `undefined`.
I dunno, that's for someone with more JS experience to answer.
