# Copy Framer Code plugin for Sketch

A Sketch plugin that copies selected layers to the clipboard as code that can be pasted straight into a Framer prototype.

- Copy one or more layers, or an entire artboard
- Layers are copied in position 
- Layers and TextLayers are drawn entirely in code*
- Export @ 1x, @ 2x or @ 3x

*If a layer is too complex to draw using code alone you will need to export and add a background image manually.

## New in Version 2
- **Support for Nested Layers**: Copy Framer Code now exports all nested layers inside any selected groups, adding the `parent` property to the sublayers.
- **Export artboards**: Select an artboard to copy all of its contents. 
- **Flatten groups** to a single layer by adding `*` to the end of the layer’s name.
- **Hidden layers** are no longer imported.

## Install
Download or clone the repository, and double click `CopyFramerCode.sketchplugin`.

or...

[![Install PLUGIN NAME with Sketchpacks](http://sketchpacks-com.s3.amazonaws.com/assets/badges/sketchpacks-badge-install.png "Install PLUGIN NAME with Sketchpacks")](https://sketchpacks.com/perrysmotors/copy-framer-code/install)

## Usage
1. Select the layers or artboard in Sketch you want to copy.
2. If you want to export from Sketch @ 1x, select `Copy Framer Code > Copy @ 1x` from the Plugins menu. Select `Copy Framer Code > Copy @ 2x` to double the scale of your design, and `Copy Framer Code > Copy @ 3x` to scale up by three. 
3. Paste the CoffeeScript code into Framer.

![copytoframer](https://cloud.githubusercontent.com/assets/12557727/25869296/bf5e85f6-34f7-11e7-92c4-508deec4f76e.gif)