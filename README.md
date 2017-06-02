# Copy Framer Code plugin for Sketch
[![Download from Sketchpacks.com](https://badges.sketchpacks.com/plugins/com.gilesperry.copy-framer-code/version.svg)](https://api.sketchpacks.com/v1/plugins/com.gilesperry.copy-framer-code/download) [![Compatible Sketch Version](https://badges.sketchpacks.com/plugins/com.gilesperry.copy-framer-code/compatibility.svg)](https://sketchpacks.com/perrysmotors/copy-framer-code)

A Sketch plugin that copies selected layers to the clipboard as code that can be pasted straight into a Framer prototype.

- Copy one or more layers, or an entire artboard
- Layers are copied in position 
- Rectangles, circles and text layers are drawn entirely in code*
- Export @ 1x, @ 2x or @ 3x

*If a layer is too complex to draw using code alone you can make the plugin copy the code needed to include an image asset for the layer, but you will need to drag the image files into the project manually.

## New in Version 3
- **Copy exported image assets**

## Features
- **Support for Nested Layers**: Copy Framer Code exports all nested layers inside any selected groups, adding the `parent` property to the sublayers.
- **Export artboards**: Select an artboard to copy all of its contents. 
- **Flatten groups** to a single layer by adding `*` to the end of the layer’s name.
- **Hidden layers** are not imported.

## Install
Download or clone the repository, and double click `CopyFramerCode.sketchplugin`.

or...

[![Install PLUGIN NAME with Sketchpacks](http://sketchpacks-com.s3.amazonaws.com/assets/badges/sketchpacks-badge-install.png "Install PLUGIN NAME with Sketchpacks")](https://sketchpacks.com/perrysmotors/copy-framer-code/install)

## Usage

Sketch Import in Framer Studio creates layers in your Framer project by exporting image assets from your Sketch file. It’s quick and easy, but it has some limitations. While you can control opacity and scale in your prototype, properties such as colour, border radius and thickness, shadows and text values are not accessible.

This plugin takes a different approach. It aims to recreate as much of your design as possible using native Framer code so you have complete control.

All it does is copy code to the clipboard. Here’s how to use it:

1. Select the layers or artboard in Sketch you want to copy.
2. If you want to export from Sketch @ 1x, select `Copy Framer Code > Copy @ 1x` from the Plugins menu. Select `Copy Framer Code > Copy @ 2x` to double the scale of your design, and `Copy Framer Code > Copy @ 3x` to scale up by three. 
3. Paste the CoffeeScript code into Framer.

![copytoframer](https://cloud.githubusercontent.com/assets/12557727/25869296/bf5e85f6-34f7-11e7-92c4-508deec4f76e.gif)

## What layer types can the plugin handle?

### Rectangles
Here is an example of the code that will be generated when you select a rectangle showing the full set of properties that can be generated:
```
rectangle = new Layer
	x: 276
	y: 40
	width: 200
	height: 100
	backgroundColor: "rgba(243,244,250,1)"
	borderRadius: 8
	borderColor: "rgba(183,190,208,1)"
	borderWidth: 2
	shadowColor: "rgba(0,0,0,0.25)"
	shadowX: 0
	shadowY: 4
	shadowBlur: 8
	shadowSpread: 0
	opacity: 0.9
```

### Circles
Circles are created by setting the border radius of the layer to half its width:
```
circle = new Layer
	x: 312
	y: 220
	width: 128
	height: 128
	backgroundColor: "rgba(243,244,250,1)"
	borderRadius: 64
	borderColor: "rgba(183,190,208,1)"
	borderWidth: 2
	shadowColor: "rgba(0,0,0,0.25)"
	shadowX: 0
	shadowY: 4
	shadowBlur: 8
	shadowSpread: 0
	opacity: 0.9

```

### Text
Text is copied as a native text layer:
```
text = new TextLayer
	x: 218
	y: 432
	text: "Type something"
	fontSize: 38
	fontFamily: "Gotham SSm"
	fontWeight: 500
	letterSpacing: -0.4
	lineHeight: 2
	textAlign: "center"
	textDecoration: "underline"
	textTransform: "uppercase"
	color: "rgba(75,79,96,1)"
	shadowColor: "rgba(0,0,0,0.25)"
	shadowX: 0
	shadowY: 4
	shadowBlur: 8
	opacity: 0.9
```

### Groups
Groups are copied along with any child layers:
```
group = new Layer
	x: 328
	y: 572
	backgroundColor: "transparent"
	width: 96
	height: 40

sublayer2 = new Layer
	parent: group
	x: 0
	y: 0
	width: 40
	height: 40
	backgroundColor: "rgba(216,216,216,1)"

sublayer1 = new Layer
	parent: group
	x: 56
	y: 0
	width: 40
	height: 40
	backgroundColor: "rgba(216,216,216,1)"
```
You can stop the plugin from copying child layers by adding `*` to the end of the layer’s name in Sketch.

### Artboards
You can select an artboard to copy all of its contents. The plugin creates a layer for the artboard itself so that you can use the screen in a flow component:  

```
artboard = new Layer
	x: 0
	y: 0
	backgroundColor: "transparent"
	width: 750
	height: 1334
```

Make sure there are no export settings set for the artboard.

### Symbols
**The plugin cannot export the contents of symbols**. Only position, size and opacity are copied. If you want the plugin to export and any layers inside a symbol you will first need to detach the symbol:
 
```
symbol = new Layer
	x: 248
	y: 668
	width: 254
	height: 96
	opacity: 0.9
```

### Slices
Slices are ignored.

### Everything else
Ovals, combined shapes, paths, images etc. are all created as layers with position and size only.

```
combinedShape = new Layer
	x: 272
	y: 844
	width: 206
	height: 136
```

## What layer styles can the plugin handle?
- Fill
- Border
- Drop shadow
- Corner radius
- Layer opacity
- Font size, family and weight
- Line height
- Character spacing

A Sketch layer can have multiple fills, borders and shadows. This is not possible in Framer. When a layer has more than one of any of these style, only the top-most style is copied. 
*Outside* and *centre* borders are converted to *inside* borders as this is all that Framer can handle.

## How include image assets
When the design of a layer cannot be represented using native code you will need to use an image asset:  

```
combinedShape = new Layer
	x: 272
	y: 844
	width: 206
	height: 136
	image: "images/Combined Shape.svg"
```

**Here’s how**:

1. Select the layer in Sketch and click *Make exportable*.

This tells the plugin to include a reference to the image in the code it generates. If you have set multiple export settings, the plugin will try to choose an export format that matches the scale you are exporting at. Failing that it will use the first in the list. Adding export settings to rectangles, circles and text layers has no effect as it is assumed these will be drawn using native code. 

2. Click the export button and export the image to the images folder in your Framer project.

**Making rectangles, circles or text exportable has no effect because it is assumed these types of layer will be created using code alone.**
