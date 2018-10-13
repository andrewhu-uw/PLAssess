# PLAssess

Backend for the PLAssess project

## Build Process

### Folder layout

```
PLAssess
├─src
├─dist
└─private-key.json
```

`src` is where your source code goes, `dist` is where transpiled code goes

### Typescript

Typescript is transpiled into Javascript, and the compiler settings are all in the `tsconfig.json`. When you want to compile your source, just run

```
tsc -p tsconfig.json
```

In the top-level directory