# yeetpoint README

A VS Code extension for more efficiently working with breakpoints. This is specifically useful if you have large files and methods to work on. If that's the case, that's a smell. You should use this tool to refactor your code to the point were this tool is mostly irrelevant :)

This current implementation is not under test.

## Features

All commands are found and executed through the VS Code Command Palette

`Shift + Command + P` (Mac)

`Ctrl + Shift + P` (Windows/Linux)

#### Commands

`yeetpoint: add breakpoints by regex`

`yeetpoint: remove breakpoints by regex`

`yeetpoint: remove breakpoints below current line`

`yeetpoint: remove breakpoints above current line`


## Notes About Memory Usage

When finding lines to insert breakpoints through regex, this extension will chunk the page contents and find matching lines while moving chunk by chunk, not loading the entire thing in memory. VS Code can already be a resource hog and I didn't want to contribute more to that. If Code can load your file to begin with, it shouldn't have much issue inserting breakpoints outside of obscenely large edge cases.

All other commands use the current active file, which already stores breakpoint information, so no extra memory is needed outside of a few temp variables :)


## Known Issues

N/A....for now 👀

## Release Notes

### 0.0.1

Hiya! 👋
