# Guide for Plugin Authors

You've decided to write a repotool plugin. Congratulations, you are a productive member of the Node.js community!

![](assets/vaultboy_approves.png)


## Overview

Repotool plugins are simply Node.js modules. Users install them globally, then apply them to different repositories.

A repotool plugin exports a single function, which takes two arguments, `opts` and `state`.

``` js
'use strict'

module.exports = function (opts, state) { /* ... */ }
```

What does this function do? It returns another function.

``` js
module.exports = function (opts, state) {
  return function () {
    console.log('Hello world!')
  }
}
```

This would be the simplest possible repotool plugin! We can use ES6 arrow functions to make the code look a bit nicer.

``` js
module.exports = (opts, state) => () => {
  console.log('Hello world!')
}
```

So what are the two functions for?

1. The first function is the **preparation function**. It should:
  - Check and make sure the environment meets all requirements
  - Print to the console an explanation what the plugin is going to do
  - Update the `state` (more on that [later](#state))
  - **NOT** modify anything yet
2. The second function is the **execution function**. It should perform the actual work that the user requested.

## State

It's very useful for plugins to be able to communicate with one another. For instance, you might have a plugin that sets up your code coverage upload. But then you want another plugin which is setting up your CI service automatically add a step for uploading code coverage.

The way this would work is for the code coverage plugin to set the `coverageUpload` state variable:

``` js
module.exports = (opts, state) => {
  state.coverageUpload = 'npm run codecov'

  return () => { /* ... */ }
}
```

The CI plugin then reads the `coverageUpload` state variable during execution:

``` js
module.exports = (opts, state) => () => {
  if (state.coverageUpload) {
    // TODO: Add coverage upload to the CI script
  }
}
```

**Important:** The rule is: Only write to `state` during preparation and only read from `state` during execution. Otherwise you'll get a race condition. 🏎
