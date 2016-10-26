# vue-dev-server

## Why?

When you decide to build a new reusable `vue` component, you probably want to see it in action in different environments without much effort.

## What?

vue-dev-server is a small development server for building `vue` components. It takes different environments (own components) and makes them available in your browser, of course with hot reload functionality.

## How?

### Install

```sh
npm install --save-dev vue-dev-server
// vue@1.0
npm install --save-dev vue-dev-server@1

# dependencies
npm install --save-dev vue webpack vue-loader
# dependencies of vue-loader
# http://vuejs.github.io/vue-loader/start/tutorial.html
npm install --save vueify-insert-css
npm install --save-dev vue-html-loader css-loader vue-style-loader vue-hot-reload-api\
  babel-loader babel-core babel-plugin-transform-runtime babel-preset-es2015\
  babel-runtime@5\
```

### Usage - cli

```
Usage: vue-dev-server [options]

  Options:

  -h, --help           output usage information
  -V, --version        output the version number
  -p, --port <number>  port to use (default: 8080)
  -f, --folder <path>  root path (default: dev)
  -s, --static <path>  exports a static version
```

### Setting up an environment

By default `vue-dev-server` will look in the `dev` folder for `vue` files.
Just create a `someName.vue` file there. Require your component from there normally.  
All environments will then be accessible under `http://localhost:8080/`.

##### Example of project layout
```
./dev/env1.vue // links your component. Contains an environment to interact with your component.
./src/comp.vue // your component.
./comp.js // your component compiled down to ES5 (for examply by `vue-compiler`).
```
If you need more examples check out [vue-comps](https://github.com/vue-comps). I'm using `vue-dev-server` for all my components.

### Using static option to create a demo for github pages

in conjuction with [gh-pages](https://github.com/tschaub/gh-pages), creating a demo is as simple as this:
```sh
vue-dev-server --static static/ && gh-pages -d static
```
just make sure you include the static folder in your .gitignore

### Setting up webpack

This is the default loaders list:
```coffee
module.exports = {
  module:
    loaders: [
      { test: /\.vue$/, loader: "vue-loader"}
      { test: /\.html$/, loader: "html"}
      { test: /\.css$/, loader: "style-loader!css-loader" }
    ]
}
```
If you need you own, put a webpack.config.js /.coffee/.json in the `dev` folder.

### Additional info

 - Add the `dev/index.js` to your `.gitignore`  
 - You can create a npm script in your `package.json`, `"scripts": {"dev": "vue-dev-server"}`. Then you can call it by `npm run dev`

## Changelog
- 2.0.0  
now compatible with vue 2.0.0  

- 1.0.0  
same as 0.2.10  

## License
Copyright (c) 2015 Paul Pflugradt
Licensed under the MIT license.
