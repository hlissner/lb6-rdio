# Rdio controls for Launchbar

Inspired by the
[Rdio alfred workflow](http://dferg.us/rdio-workflow-for-alfred-2/), and modeled
like the built-in iTunes actions with the following actions:

* Play
* Play/Pause (toggle)
* Stop
* Next/Previous Song
* Add to Collection
* Search Rdio (by [nanovid](http://nanovivid.com/))

## Installation

[Download the ZIP](https://github.com/hlissner/lb6-rdio/archive/master.zip) and run the file!

## Troubleshooting

By default, the action uses my Rdio API key, which has a 10-per-second and 15k-per-day
call limit. If search is acting slow for you (or gives out entirely):

1. Register an account at http://rdio.mashery.com/ and generate an API key.
2. Substitute your api key for mine in `~/Library/Application Support/LaunchBar/Action
   Support/io.henrik.launchbar.Rdio/Preferences.plist`.

## Requirements

* The Rdio app
* [Launchbar](http://www.obdev.at/products/launchbar/index.html)
