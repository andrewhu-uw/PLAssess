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

We test the transpiled javascript using Mocha & Chair. Run the following command to install these two

```
npm install -g mocha chai
```

### Running Tests

`npm` should have added `mocha` to your path, so you should now be able to run tests with 

`mocha dist/test-name`

With VS Code you should be able to run the task `test`.