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

If you create lots of NPM modules, you're probably tired of setting up your package.json, your eslint config, your CI script, your commitizen config, your code coverage tool, your README.md badges, semantic-release, greenkeeper... You get the idea.

Sure, there's [Yeoman](http://yeoman.io/) and that's great for the initial setup. But what about afterwards? Generators get updated and your repo is left behind. Slowly, but surely all of your modules drift in slightly different directions. One has the wrong license, another has a broken link for a badge and the third uses that code coverage tool you no longer like.

**Repotool** is a CLI tool providing **modular, idempotent repository management**.

* ##### Define your module policy

  What should your modules look like, which license should they use, etc.

* ##### Create new modules quickly

  Repotool can generate new modules (using **`repotool apply`**), but since it consists of single-purpose modules instead of generators, you can mix and match to get the exact setup you want.

* ##### Verify modules still comply with your policy

  You can run **`repotool verify`** as part of your CI workflow to ensure that your module is still compliant with the latest version of your policy.

* ##### Update modules when your policy changes

  Run **`repotool update`** to update your policy and ensure your modules still comply with it.

* ##### For tool authors: Automate setup workflows

  If you're the author of a popular Node.js CLI tool, create a repotool plugin! A plugin makes it easy for your users to include your tool in their workflow across all of their repos.

* ##### For framework authors: Stay engaged with your users

  If you're the author of a framework, create a repotool policy that your users can use to generate new modules and keep them up-to-date. A good repotool policy can let you stay in touch with your users and let them know when they aren't following best practices. Warn about deprecated features, handle repetitive migration tasks automatically and

## Installation

``` sh
npm install -g repotool
```

## Quick Start

##### Create a module

The fastest way to try out Repotool is by creating a new module using an existing policy.

``` sh
mkdir my-repotool-test
cd my-repotool-test
repotool apply --save repotool-policy-standard
```

* The command **`repotool apply`** creates a new module from scratch or applies a repotool policy to an existing module. This command is interactive and when run for the first time lets you customize your settings etc.
* `repotool-policy-standard` is a basic Repotool configuration policy that we're using for this example.
* The `--save` flag causes Repotool to store the policy and any configuration you enter in your package.json, so it will know which policy to use in the future.

Repotool will ask you some questions and predict what it will do. If everything looks ok, just confirm and your module will be created.

##### Applying a policy to an existing module

Applying a policy to an existing module works exactly the same way:

``` sh
cd my-existing-module
repotool apply --save repotool-policy-standard
```

##### Validate your repo

To check a module against its Repotool policy, just call **`repotool verify`**.

##### Create your own policy

To create your own policy, just fork the [**`repotool-policy-standard`**](https://github.com/repotool/repotool-policy-standard) repo and edit as desired.
