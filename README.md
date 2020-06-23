## Batch Video Conversion Desktop Utility | Electron + React + Redux

```
Author: Matthew T Zito
License: GPL 3.0
```
## Table of Contents

 - [Introduction](#intro) 
    * [Demo](#demo)
    * [Boilerplate / Tutorial](#tut)
 - [Documentation](#docs)
    * [Development](#dev)
    * [Packaging for Production](#prod)

## <a name="intro"></a> Introduction
This package is a simple cross-platform desktop application that performs batch processing of video file conversions.
There aren't many free (Note: as RMS would say, "Free as in freedom, not 'free beer'") video converter apps out there, and the ones that are free (this time as in "free beer") are compiled with tons of bloatware, malware, and other unwanted goodies.

This repository also serves as a boilerplate for simple Electron + React + Redux setup for both development *and* production. I'll be extending this README into a full-fledged tutorial soon; do let me know if you would be interested in such a tutorial by filing an issue, subject beginning with `[REQUEST]`. This will probably motivate me to do it sooner, knowing that fellow developers will actually benefit from it. 

### Batch Video Converter Demo (Full Electron-integrated React + Redux app)
![demo](https://github.com/MatthewZito/autowatch-batch-conversion/blob/master/documentation/batch-converter-demo.gif)

### <a name="tut"></a>  Electron + React + Redux Boilerplate (2020)
This tutorial covers how to integrate React + Redux with Electron for both development and production with *no hassle*. With this method, you'll only be *updating a single line of code* in your app's source. Please star this repo if you found it helpful!

Follows are some of the important configurations we need to add in order to wire up Electron to an existing React app.

*Mitigating Unwanted Default React Behaviors*
You'll notice a `.env` file in this repo. Setting `BROWSER=none` will prevent `react-scripts`' default behavior - launching the browser. We don't want that. We can put this in a `.env` file to make it applicable to all scripts; this way we don't have to export it over and again. To create yours:
```
touch .env && echo 'BROWSER=none' > .env
```

Now, here's a huge caveat to be apprised of. We are using `react-scripts` here to essentially emulate the tried-and-true methodologies for pairing Electron with Create-React-App. This means we will be subject to a certain unwanted default behavior of CRA (well, `react-scripts` to be specific): `electron-builder` stores assets e.g. icons etc. in a “build” folder, and `react-scripts` outputs compiled files into...guess what? A “build” folder! Ergo, we need to change the `electron` build location. We can bypass this altogether by copying the `electron` source-code into the resulting build directory, but *before* packaging. This is what `npm run build-electron` is doing.

*Ensuring Proper Path Resolution*
In `package.json`, we set the “homepage” field so as to use relative paths lest the package scripts be unable to find the minified files:
```
"homepage": "./"
```

Also, your "main" field should be pointing toward your electron entrypoint file. Mine is `app/electron.js`.

The mount URL we use in our `mainWindow` object is dynamically assigned. In the build scripts, we set `ELECTRON_START_URL` to `http://localhost:3000` for development. Otherwise, we point the URL at the compiled `index.html` which *will* exist once we run the script. You'll need to ensure your path resolves properly if your directory structure is different than mine:

```
filePath: process.env.ELECTRON_START_URL || url.format({
            pathname: path.join(__dirname, '../../index.html'),
            protocol: 'file:',
            slashes: true,
          })
```

Note that - as reflected in `package.json` - we want to call `set` in lieu of `export` to set environment variables on Windows. 

Finally, we need to add some configurations to the "build" field of `package.json` to ensure that our build source can be resolved correctly. To do this, we add:
```
"build": {
    "files": [
      "build/**/*",
      "dist/**/*",
      "node_modules/**/*"
    ]
  }
```

*Video Converter-Specific Configurations*
This is in no way mandatory for Electron and React + Redux; only worry about this option if you're trying to run my app (or if you happen to be using `ffmpeg` in your project).

Read about how to resolve the infamous `ffmpeg` "format is undefined" error [below](#ffmpeg)

## <a name="docs"></a> Documentation

### <a name="dev"></a> Development Configurations
We can run dev mode via two means. The simplest uses `concurrently` along with `wait-on`. If you're familiar with Docker / Docker Compose, this is analogous to `wait-for-it`. As the names suggest, this script will run the Electron and React processes concurrently, but the Electron process will only be initiated once the React app is being served.

These "wait" scripts are common in CI/CD pipelines for multi-service applications. The general idea is to run a loop that `pings` the dependency service (typically a specific, programmer-configured healthcheck endpoint) until the desired response has been received (e.g. an indicator for whatever constitutes as 'readiness', or 'liveness', contingent on your use-case). The dependent services cannot launch until the `wait` script has exited with a successful status. Of course, all of this can be configured with great granularity, but you get the idea. You can see a more complex example of this in my cloud project [here](https://github.com/MatthewZito/goldmund-automated-cluster/blob/master/scripts/wait-for-it.sh).

Anyway...

Using `concurrently` and `wait-on` (recommended):
```
# Actual script:
concurrently \"npm start\" \"wait-on http://localhost:3000 && electron ./app/\"

# Via the NPM script I've included:
npm run dev
```

If you truly need to decouple the processes for whatever reason, you can simply start up the processes manually like so:
```
npm start && npm start-electron
# or the Windows analog; see other scripts
```

### <a name="prod"></a> Packaging for Production (Mac + Windows)
I'll probably just add a MakeFile, shell script, or something else to automate this entire thing later. For now, this is what we do to compile a *working* executable:

  1. Utilize `react-scripts` to compile renderer src (i.e. the React code)
  2. Allocate `Electron` src into respective build directories so as to use compiled src from step 1
  3. Use `electron-packager` to compile the resulting build src from steps 1 + 2 into executables

These steps are run like so:
```
# step 1
npm run build
# step 2
npm run build-electron
# step 3
npm run package
```

##### <a name="ffmpeg"></a> *A Note on `ffmpeg`*
Note that the package `hazardous` is absolutely imperative here for production builds. `hazardous` acts as a middleware of sorts that overrides native `Node.js` path methods to check for unpacked `.asar` archives. If found, the paths are resolved using a relatively performant, platform-agnostic algorithm that leverages a regex to resolve to the proper `app.asar.unpacked` allocation. If this package is *not* used, production builds will not function as the electron client will be unable to call `ffmpeg` - the `.asar` paths will be misaligned.


*For a Windows-specific build, we might better be served by adding the following options inside of the `package.json` "build" field:*
```
...
"mac": {
    "target": [
        "zip"
    ],
    "publish": [
        "github"
    ]
    },
"win": {
    # electron-builder throws a fit if you don't include these vals
    "publisherName": "<YOUR_NAME>",
    "publish": [
        "github"
    ],
"target": [
    "nsis"
    ]
},
"linux": {
    "target": [
        "AppImage",
        "tar.gz"
        ]
},
...
```
*Note that I've added configs for the whole triumvirate - Mac, Windows, Linux, just to be thorough. You really only need the Windows config for the Windows-specific build target.*

We then use the alternative Windows build script, `alt-build-for-win`.


