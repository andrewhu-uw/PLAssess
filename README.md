# PLAssess

Backend for the PLAssess project

## Build Process

### Folder layout

```
PLAssess
├─src
├─dist
└─priv
  └─firestore-private-key.json
```

`src` is where your source code goes, `dist` is where transpiled code goes

### Typescript

Typescript is transpiled into Javascript, and the compiler settings are all in the `tsconfig.json`. When you want to compile your source, just run

```
tsc -p tsconfig.json
```

In the top-level directory

## Testing

### Installing Mocha & Chai

We test the transpiled javascript using Mocha & Chai. Run the following command to install these two

```
npm install -g mocha chai
```

### Running Tests

`npm` should have added `mocha` to your path, so you should now be able to run tests with 

`mocha dist/test-name`

With VS Code you should be able to run the task `test`.

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

## Architecture

### Firebase Connection

The connection to the firebase DB is controlled by the DB module in DB.ts

`DB.init()` must be called before any transactions with the database can be made.
After that, objects can be loaded from the database with the `DB.get*()` functions and
any class that implements the `FirestoreSync` interface can be used to send updates
 to the database.