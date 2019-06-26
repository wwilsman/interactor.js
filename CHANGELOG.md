# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Fixed

- Collection count assertion not returning topmost parent
- Ability to define assertions with matching built-in names
- `check` and `uncheck` actions not sending click event
- `uncheck` working with radio buttons

## [1.4.2] - 2019-06-24

### Fixed

- Export `computed` helper

## [1.4.1] - 2019-06-09

### Fixed

- `from` POJO getters being evaluated instead of transferred to the custom
  interactor class

## [1.4.0] - 2019-06-09

### Added

- Ability to provide a custom matcher function to computed property assertions
- Ability for computed property assertions to assert truthyness when no
  arguments are provided
- Ability for computed property assertions to accept regular expressions
- Displaying computed selectors in assertion errors
- `checked` property and property creator
- `selected` property and property creator

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
