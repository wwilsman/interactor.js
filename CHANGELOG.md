# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

## [0.7.0] - 2018-07-06

### Changed

- upgrade `@bigtest/convergence` to `^0.10.0`

## [0.6.0] - 2018-07-03

### Added

- `scoped` interactor method to return nested and scoped interactors
- ability to specify a selector function for collections

## [0.5.1] - 2018-07-02

### Fixed

- a bug where interactors returned from deeply nested methods were not
  instances of the topmost parent

## [0.5.0] - 2018-05-26

### Added

- `scoped` property creator for scoped interactors
- `only` method so nested interactors can break out of parent chains
- `select` method and `selectable` property creator

### Changed

- relax restrictions around reserved interactor properties
- default properties can be freely overwritten
- interactor decorator to support pojos
- upgrade `@bigtest/convergence` to `0.9.1`

## [0.4.4] - 2018-05-05

### Changed

- more documentation fixup

## [0.4.3] - 2018-05-05

### Changed

- escaped decorator documentation and updated documentation tags for
  more accurate output

## [0.4.2] - 2018-04-30

### Fixed

- `is` property when selector is omitted

## [0.4.1] - 2018-04-27

### Added

- transpiled es module bundle

### Changed

- providing a `parent` to an interactor will return a modified
  instance that contains wrapped methods to append new instances to
  the `parent` interactor

### Fixed

- deployment issues
- nested interactors incorrectly returned a parent instance within
  complex interaction methods which caused errors

## [0.4.0] - 2018-04-07

### Added

- `docs` script to generate documentation
- some default property getters to new `Interactor` instances
- nested interactor methods now return an instance of the topmost
  interactor parent when using the `@interactor` decorator
- `defaultScope` static property

### Changed

- `Interaction` class is now `Interactor`
- `@page` decorator is now `@interactor`
- interaction creator arguments are now ordered with the optional
  selector as the first argument
- the `collection` helper now lazily finds the root for collection
  interactors instead of eagerly doing so
- upgrade `@bigtest/convergence` to `0.7.0`

### Removed

- `PageObject` class

## [0.3.0] - 2018-03-16

### Changed

- upgrade `@bigtest/convergence` to `0.6.0` to support async/await syntax

## [0.2.0] - 2018-03-14

### Changed

- upgrade `@bigtest/convergence` to `0.5.0`

### Fixed

- `isPresent` property returns false when the root does not exist
- `.pause()` methods that halts the convergence when it is encountered
