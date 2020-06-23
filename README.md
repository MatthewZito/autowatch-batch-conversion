## Batch Video Conversion Desktop Utility

This package is a simple cross-platform desktop application that performs batch processing of video file conversions.
There aren't many free (Note: as RMS would say, "Free as in freedom, not 'free beer'") video converter apps out there, and the ones that are free (this time as in "free beer") are compiled with tons of bloatware, malware, and other unwanted goodies.

## Running Dev 
We can run dev mode via two means. The simplest:

```
# Verbose:
concurrently \"npm start\" \"wait-on http://localhost:3000 && electron ./app/\"

# Or more concisely with the script I've included:
npm run dev
```

And a bit more complicated, but do this if you need to truly decouple the processes:
```
npm start && npm start-electron
# or the Windows analog; see other scripts
```

## Packaging 
I'll probably just add a MakeFile, shell script, or something else to automate this entire thing later. For now:

  1. Utilize `react-scripts` to compile renderer src (i.e. the React code)
  2. Allocate `Electron` src into respective build directories so as to use compiled src from step 1
  3. Use `electron-packager` to compile the resulting build src from steps 1 + 2 into executables

  Here:
  ```
  # step 1
  npm run build
  # step 2
  npm run build-electron
  # step 3
  npm run package

  ```

  Note that the package `hazardous` is absolutely imperative here for production builds. The package acts as a middleware of sorts that overrides native `Node.js` path methods to check for unpacked `.asar` archives. If found, the paths are resolved using a relatively performant, platform-agnostic algorithm that leverages a regex to resolve to the proper `app.asar.unpacked` allocation. If this package is *not* used, production builds will not function as the electron client will be unable to call `ffmpeg` - the `.asar` paths will be misaligned.