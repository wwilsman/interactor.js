# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)

## [Unreleased]

## [1.2.0] - 2019-04-10

### Changed

- `click` action no longer checks if element is focusable

## [1.1.0] - 2019-04-10

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
