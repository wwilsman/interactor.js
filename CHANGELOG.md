# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Added

- Ability to provide a custom matcher function to computed property assertions
- Ability for computed property assertions to assert truthyness when no
  arguments are provided
- Displaying computed selectors in assertion errors

### Fixed

- Undefined or null properties causing errors
- `assert.not` assertions resolving when an element does not exist
- `$element` argument being eagerly computed
- Non-enumerable static properties not being carried over
- Incorrect parent class when extending from custom interactors

## [1.3.1] - 2019-05-23

### Fixed

- Assert error message fallback to defaultScope when no specific scope

## [1.3.0] - 2019-05-20

### Added

- Auto-defined assertions based on user-defined computed getter properties

### Fixed

- Assigning to getters using the legacy decorator

## [1.2.0] - 2019-05-10

### Changed

- `click` action no longer checks if element is focusable

## [1.1.0] - 2019-05-10

### Added

- Auto-defined assertions based on interactor properties
- `assert.scoped()` method to replace assertion selectors
- `count` method, assertion, and property creator
- Nesting collections in an assert returns a `count` assertion based on the
  collection scope

### Changed

- Remove global environment references to better support virtual DOMs

### Fixed

- Typing into React components without updating the value
- Nested assertions not appending upwards

## [1.0.1] - 2019-04-23

### Changed

- Update dependencies

## [1.0.0] - 2019-04-08

### Added

- First release
