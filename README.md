# DOOM-fire NODE MODE
Test your (tty) might!  The DOOM fire algorithm will throw 90k - 180k of screen updates a frame art your dependable.

![Demo](https://user-images.githubusercontent.com/76228776/149641459-f36cd64a-c337-47c8-b573-c0b6fbc26dcd.mp4)

# INSTALLATION
Tested w/Node v17, MacOSX 12.1 Monterey (M1).  No dependencies.

```
$ git clone https://github.com/const-void/DOOM-fire-node/
$ npm start
```

# Notes
Older node sibling to https://github.com/const-void/DOOM-fire-zig

* Terminal.app - bad
* VS Code - Great

What is interesting is Terminal.app has a much lower FPS, but is not blocking output despite choking on the updates.  Feels like a termios setting is ary BUT how to research?
