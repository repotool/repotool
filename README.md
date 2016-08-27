# repotool

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
