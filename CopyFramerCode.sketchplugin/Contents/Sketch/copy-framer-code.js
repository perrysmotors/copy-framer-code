var layerNames = {};

function copyAt1x(context) {
  scale = 1;
  onRun(context);
}

function copyAt2x(context) {
  scale = 2;
  onRun(context);
}

function copyAt3x(context) {
  scale = 3;
  onRun(context);
}

////////////////////////////////////////////////////////////////////////////////

function onRun(context) {

  var sketch = context.api();
  var document = sketch.selectedDocument;
  var selection = document.selectedLayers;

  if (selection.isEmpty) {
    sketch.message("Select one or more layers to copy");
    return false;
  }  else {
    sketch.message("Copying @ " + scale + "x");
  }

  var sketchObject, copy = "";

  selection.iterate(function(layer) {

    sketchObject = layer.sketchObject;

    switch(sketchObject.class()) {
      // case MSLayerGroup:
      //   log("Group");
      //   break;
      case MSShapeGroup:
        if (isRectangle(sketchObject) || isCircle(sketchObject)) {
          copy = copy + layerWithPropertiesCode(sketchObject);
        } else {
          copy = copy + layerCode(sketchObject);
        }
        break;

      case MSTextLayer:
        copy = copy + textLayerCode(sketchObject);
        break;

      default:
        copy = copy + layerCode(sketchObject);
    }

  });

  clipboard.set(copy);

};

////////////////////////////////////////////////////////////////////////////////

function layerWithPropertiesCode(layer) {

  var framerObject = {};

  framerObject.x = layer.absoluteRect().rulerX() * scale;
  framerObject.y = layer.absoluteRect().rulerY() * scale;
  framerObject.width = layer.frame().width() * scale;
  framerObject.height = layer.frame().height() * scale;

  var fill = topFill(layer.style());
  if (fill == null) {
    framerObject.backgroundColor = '"transparent"'
  } else {
    framerObject.backgroundColor = rgbaCode(fill.color());
  }

  var borderRadius
  if (isCircle(layer)) {
    borderRadius = framerObject.width / 2;
  } else {
    borderRadius = layer.layers().firstObject().cornerRadiusFloat() * scale;
  }
  if (borderRadius != 0) {
    framerObject.borderRadius = borderRadius;
  }

  var border = topBorder(layer.style());
  if (border != null) {
    framerObject.borderColor = rgbaCode(border.color());
    framerObject.borderWidth = border.thickness() * scale;
  }

  var shadow = topShadow(layer.style());
  if (shadow != null) {
    framerObject.shadowColor = rgbaCode(shadow.color());
    framerObject.shadowX = shadow.offsetX() * scale;
    framerObject.shadowY = shadow.offsetY() * scale;
    framerObject.shadowBlur = shadow.blurRadius() * scale;
    framerObject.shadowSpread = shadow.spread() * scale;
  }

  var opacity = layer.style().contextSettings().opacity();
  if (opacity != 1) {
    framerObject.opacity = opacity;
  }

  var name = camelize(layer.name());
  name = uniqueLayerName(name);

  return name + ' = new Layer\n' + framerLayerProperties(framerObject) + '\n';
}

function textLayerCode(layer) {

  var framerObject = {};

  framerObject.x = layer.absoluteRect().rulerX() * scale;
  framerObject.y = layer.absoluteRect().rulerY() * scale;

  // if text is fixed width
  if (layer.textBehaviour() == 1) {
    framerObject.width = layer.frame().width() * scale;
  }

  framerObject.text = '"' + layer.stringValue() + '"';
  framerObject.fontSize = layer.fontSize() * scale;
  framerObject.fontFamily = '"' + layer.font().familyName() + '"';

  var fontStyle = getFontStyle(layer);
  if (fontStyle.slope != "") {
    framerObject.fontStyle = fontStyle.slope;
  }
  if (fontStyle.weight != "") {
    framerObject.fontWeight = fontStyle.weight;
  }

  if (layer.characterSpacing() != null) {
    framerObject.letterSpacingCode = (layer.characterSpacing() * scale).toFixed(1);
  }

  if (layer.lineHeight() != 0) {
    framerObject.lineHeight = layer.lineHeight() * scale / framerObject.fontSize;
  }

  switch(layer.textAlignment()) {
    case 1:
      framerObject.textAlign = '"right"';
      break;
    case 2:
      framerObject.textAlign = '"center"';
      break;
    default:
      framerObject.textAlign = '"left"';
  }

  framerObject.color = rgbaCode(layer.textColor());

  var shadow = topShadow(layer.style());
  if (shadow != null) {
    framerObject.shadowColor = rgbaCode(shadow.color());
    framerObject.shadowX = shadow.offsetX() * scale;
    framerObject.shadowY = shadow.offsetY() * scale;
    framerObject.shadowBlur = shadow.blurRadius() * scale;
  }

  var opacity = layer.style().contextSettings().opacity();
  if (opacity != 1) {
    framerObject.opacity = opacity;
  }

  var name = camelize(layer.name());
  name = uniqueLayerName(name);

  return name + ' = new TextLayer\n' + framerLayerProperties(framerObject) + '\n';
}

function layerCode(layer) {

  var framerObject = {};

  framerObject.x = layer.absoluteRect().rulerX() * scale;
  framerObject.y = layer.absoluteRect().rulerY() * scale;
  framerObject.width = layer.frame().width() * scale;
  framerObject.height = layer.frame().height() * scale;

  var name = camelize(layer.name());
  name = uniqueLayerName(name);

  return name + ' = new Layer\n' + framerLayerProperties(framerObject) + '\n';
}

function framerLayerProperties(object) {
  var text = "";
  Object.keys(object).forEach(function(key) {
    text = text + '\t' + key + ': ' + object[key] + '\n';
  });
  return text;
}

////////////////////////////////////////////////////////////////////////////////

function topFill(style) {
  var fills = style.enabledFills();

  var i, len, fill = null;
  for (i = 0, len = fills.length; i < len; i++) {
    var fillType = fills[i].fillType();
    if (fillType == 0) {
      fill = fills[i]
    }
  }

  return fill;
}

function topBorder(style) {
  var borders = style.enabledBorders();

  var i, len, border = null;
  for (i = 0, len = borders.length; i < len; i++) {
    var fillType = borders[i].fillType();
    if (fillType == 0) {
      border = borders[i]
    }
  }

  return border;
}

function topShadow(style) {
  var shadows = style.enabledShadows();
  var len = shadows.length;

  if (len == 0) {
    return null;
  } else {
    return shadows[len-1];
  }
}

////////////////////////////////////////////////////////////////////////////////

function isRectangle(layer) {
  var layerCount = layer.layers().count();
  var layerClass = layer.layers()[0].class();

  if (layerCount == 1 && layerClass== MSRectangleShape) {
    return true;
  } else {
    return false;
  }
}

function isCircle(layer) {
  var layerCount = layer.layers().count();
  var layerClass = layer.layers()[0].class();
  var width = layer.frame().width();
  var height = layer.frame().height();

  if (layerCount == 1 && layerClass== MSOvalShape && width == height) {
    return true;
  } else {
    return false;
  }
}

function rgbaCode(colour) {
  var red = Math.round(colour.red()*255);
  var green = Math.round(colour.green()*255);
  var blue = Math.round(colour.blue()*255);

  return '"rgba(' + red + ',' + green + ',' + blue + ',' + colour.alpha() + ')"';
}

function getFontStyle(layer) {

  var fontWeights = {
  	"thin": 100,
  	"extralight": 200,
  	"ultralight": 200,
  	"light": 300,
  	"book": 400,
  	"normal": 400,
  	"regular": 400,
  	"roman": 400,
  	"medium": 500,
  	"semibold": 600,
  	"demibold": 600,
  	"bold": 700,
    "boldmt": 700,
    "psboldmt": 700,
  	"extrabold": 800,
  	"ultrabold": 800,
  	"black": 900,
  	"heavy": 900
  }

  var fontFamily = layer.font().familyName().replace(/ /g, "");
  var fontName = layer.fontPostscriptName().replace(/-/g, "");
  var val = fontName.replace(fontFamily, "").toLowerCase();

  var fontWeight = "", fontSlope = "";

  if (val.includes("italic")) {
    fontSlope = '"italic"';
    val = val.replace("italic", "");
  }

  if (val.includes("oblique")) {
    fontSlope = '"oblique"';
    val = val.replace("oblique", "");
  }

  if (fontWeights[val] != undefined) {
    fontWeight = fontWeights[val];
  }

  return {weight: fontWeight, slope: fontSlope};
}

////////////////////////////////////////////////////////////////////////////////

function camelize(str) {
  str = str.replace(/-/g, " ");
  str = str.replace(/[^a-zA-Z0-9$_ ]/g, "")
  str = str.trim();
  if (firstCharIsInvalid(str)) {
    str = "layer_" + str;
  }
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

function firstCharIsInvalid(str) {
  return str.charAt(0).match(/[^a-z$_]/i);
}

function uniqueLayerName(name){
  if (layerNames[name] > 0) {
    var count = ++layerNames[name];
    return name + "_" + count;
  }
  else {
    layerNames[name] = 1;
    return name;
  }
}

////////////////////////////////////////////////////////////////////////////////

// Using JSTalk clipboard handling snippet from https://gist.github.com/uhunkler/5465857 by Urs Hunkler
var clipboard = {
  // store the pasetboard object
  pasteBoard : null,

  // save the pasteboard object
  init : function()
  {
    this.pasteBoard = NSPasteboard.generalPasteboard();
  },
  // set the clipboard to the given text
  set : function( text )
  {
    if( typeof text === 'undefined' ) return null;

    if( !this.pasteBoard )
      this.init();

    this.pasteBoard.declareTypes_owner( [ NSPasteboardTypeString ], null );
    this.pasteBoard.setString_forType( text, NSPasteboardTypeString );

    return true;
  },
  // get text from the clipbaoard
  get : function()
  {
    if( !this.pasteBoard )
      this.init();

    var text = this.pasteBoard.stringForType( NSPasteboardTypeString );

    return text.toString();
  }
};
