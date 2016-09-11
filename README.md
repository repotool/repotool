# repotool

[![npm][npm-image]][npm-url] [![JavaScript Style Guide][standard-image]][standard-url] [![CircleCI][circle-image]][circle-url] [![Codecov][codecov-image]][codecov-url]

[npm-image]: https://img.shields.io/npm/v/repotool.svg?style=flat
[npm-url]: https://img.shields.io/npm/v/repotool.svg?style=flat
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[standard-url]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[circle-image]: https://circleci.com/gh/justmoon/repotool.svg?style=shield
[circle-url]: https://circleci.com/gh/justmoon/repotool.svg?style=shield
[codecov-image]: https://codecov.io/gh/justmoon/repotool/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/justmoon/repotool/branch/master/graph/badge.svg

> Automatically set up your repositories!

If you create lots of NPM modules, you're probably tired of setting up your package.json, your eslint config, your CI script, your commitizen config, your code coverage tool, your README.md, semantic-release, greenkeeper... You get the point.

Sure, there's [Yeoman](http://yeoman.io/), but what if you've already created a module? Start from scratch? Repotool ensures your existing modules are correctly configured.

## Installation

``` sh
npm install -g repotool
```

## Usage

Everyone sets up their modules slightly differently - so how does repotool know your preferences?

The answer is that it allows you to specify a policy file! That looks something like this:

``` json
{
  "plugins": [{
    "module": "standard"
  }, {
    "module": "circle"
  }]
}
```

Just put that file up somewhere like [Gist](https://gist.github.com) and copy the raw link. Then you can run repotool like so:

```
repotool https://gist.github.com/justmoon/d6989ac091ee4cfb64860aec501e2792
```
