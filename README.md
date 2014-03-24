# Ukkio CLI

Client tool to develop, test and (soon) publish your HTML5 game in [Ukkio](http://developer.ukk.io). 

## Getting started

**No signup required** to test or develop but it still mandatory when you want deploy your game for review. 
Yes, we review your game only to be sure that it respect the [Ukkio's rules](http://developer.ukk.io/#rules) and correctly implements the SDK.

Let's start:

```
$ npm install ukkio-cli -g
```

On the terminal type:

```
$ cd /my/fantastic/html5/game/folder
$ ukkio init
```

Follow instructions on the screen and then:

```
$ ukkio sandbox
Sanbox started: point your browser at http://localhost:5005/
```

And that's it! Point your browser at http://localhost:5005/ and a summary page of your data will appear. Press on the *play* button 
in the top right corner to start your game inside a simulated Ukkio's environment (in another words: `iframe`).

Now you are ready to test the SDK.

## SDK

To download SDK and read documentation refer to Github project [ukkio-sdk](https://github.com/ukkio/ukkio-sdk).

## Commands

### ukkio init

An utility to create a valid `ukkio.json` that is mandatory to deploy your game. You can skip this command if you want to quickly test your game
but be sure that index.html exists and it is the main file.

Ukkio.json:

- `name`: Complete and verbose game's name.
- `version`: The game version. You can use any kind of format you prefer. It is useful for debugging and caching.
- `author`: Your name, nickname or company name. Will be displayed on the game page.
- `main`: File name of the main file, index.html by default. It must be an html file with all your game dependencies included.
- `artworks`: object with the paths to the artworks. It have to contains at least the biggest file of 1024x1024px. No matter if JPEG or PNG.
  Optionally you can indicate the 512px version and the 320px version (used in mobile phones). Use them if you want a different graphic and not only
  resized version of the 1024 image.

	```js
	artworks: {
		"1024": "build/artwork_1024.png",
		"512": "build/artwork_512.png"
		"320": "build/artwork_320.png"
	}
	```
- `devices`: array of supported devices. Values are: `desktop`, `tablet`, `mobile`. When you deploy your game, after all bureaucratic checks, we test
  it on android, ios, wp8, etc.. So we take care to publish it only on devices where it runs very well. Only a note: if your game isn't designed
  for tablets but you inserted in the list we'll reject the game.

	```js
	[ "desktop", "tablet", "mobile" ]
	```

- `path`: (optional) It represent the relative path from the `ukkio.json` and the distribution folder.

	```
	build/
		artwork.png <- all game files are under build directory
		index.html 
		game.js
	...
	ukkio.json
	```

### ukkio sandbox

Launch a web server that emulate Ukkio. You can use sandbox to test all the features available on the real site.

- `-d`, `--dir` <directory> directory containing ukkio.json

	Use this parameter to set a different working directory. By default it uses the current directory.

- `-p`, `--port` <port> port for webserver to be used (default 5005, 5006)

	Two ports (WTF)? The sandbox starts two web servers, the first one (5005) contains the emulator and the second one (5006)
	points to your game code. If you specify the `-p` parameter it starts `-p` and `-p` + 1.

- `-v`, `--verbose` show logs

	There is no magic behind this. Only logs printed on the command line.

### ukkio deploy

Coming soon.

Actually we are not on-line with the player's site so be patient and test your game with sandbox. Register your e-mail
to our mailing list from [Ukkio developer's site](http://developer.ukk.io) and we will contact you when we are ready to distribute the game.


## License

```
The MIT License (MIT)

Copyright (c) 2014 Ukkio

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```


