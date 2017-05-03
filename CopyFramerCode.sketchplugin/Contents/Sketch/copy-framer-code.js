function copyAt1x(context) {
  scale = 1;
  onRun(context);
}

function copyAt2x(context) {
  scale = 2;
  onRun(context);
}

function onRun(context) {

  var doc = context.document;
  var selectedLayers = context.selection;
  var selectedCount = selectedLayers.count();

  if (selectedCount == 0) {
    [doc showMessage: "Select one or more layers to copy"];
    return false;
  } else {
    [doc showMessage: "Copying @ " + scale + "x"];
  }

  var i, len, layer, copy = "";
  for (i = 0, len = selectedLayers.length; i < len; i++) {
    layer = selectedLayers[i];

    switch(layer.class()) {
      // case MSLayerGroup:
      //   log("Group");
      //   break;
      case MSShapeGroup:
        if (isRectangle(layer) || isCircle(layer)) {
          copy = copy + layerWithPropertiesCode(layer);
        } else {
          copy = copy + layerCode(layer);
        }
        break;

      case MSTextLayer:
        copy = copy + textLayerCode(layer);
        break;

      default:
        copy = copy + layerCode(layer);
    }

  }

  clipboard.set(copy);

};

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
    fontSlope = "italic";
    val = val.replace("italic", "");
  }

  if (val.includes("oblique")) {
    fontSlope = "oblique";
    val = val.replace("oblique", "");
  }

  if (fontWeights[val] != undefined) {
    fontWeight = fontWeights[val];
  }

  return {weight: fontWeight, slope: fontSlope};
}


function layerWithPropertiesCode(layer) {
  var name = camelize(layer.name());

  var x = layer.absoluteRect().rulerX() * scale;
  var y = layer.absoluteRect().rulerY() * scale;
  var width = layer.frame().width() * scale;
  var height = layer.frame().height() * scale;

  var newLayerCode = name + ' = new Layer\n' + '\tx: ' + x + '\n' + '\ty: ' + y + '\n' + '\twidth: ' + width + '\n' + '\theight: ' + height + '\n';

  var backgroundColorCode, borderRadiusCode = "", borderStyleCode = "", shadowCode = "", opacityCode = ""

  var fill = topFill(layer.style());
  if (fill == null) {
    backgroundColorCode = '\tbackgroundColor: "transparent"\n';
  } else {
    backgroundColorCode = '\tbackgroundColor: ' + rgbaCode(fill.color()) + '\n';
  }

  var borderRadius
  if (isCircle(layer)) {
    borderRadius = width / 2;
  } else {
    var borderRadius = layer.layers().firstObject().cornerRadiusFloat() * scale;
  }
  if (borderRadius != 0) {
    borderRadiusCode = '\tborderRadius: ' + borderRadius + '\n';
  }

  var border = topBorder(layer.style());
  if (border != null) {
    var borderColor = border.color();
    var borderWidth = border.thickness() * scale;

    borderStyleCode = '\tborderColor: ' + rgbaCode(borderColor) + '\n' + '\tborderWidth: ' + borderWidth + '\n';
  }

  var shadow = topShadow(layer.style());
  if (shadow != null) {
    var shadowColor = shadow.colorGeneric();
    var shadowX = shadow.offsetX() * scale;
    var shadowY = shadow.offsetY() * scale;
    var shadowBlur = shadow.blurRadius() * scale;
    var shadowSpread = shadow.spread() * scale;

    shadowCode = '\tshadowColor: ' + rgbaCode(shadowColor) + '\n';
    shadowCode = shadowCode + '\tshadowX: ' + shadowX + '\n';
    shadowCode = shadowCode + '\tshadowY: ' + shadowY + '\n';
    shadowCode = shadowCode + '\tshadowBlur: ' + shadowBlur + '\n';
    shadowCode = shadowCode + '\tshadowSpread: ' + shadowSpread + '\n';
  }

  var opacity = layer.style().contextSettings().opacity();
  if (opacity != 1) {
    opacityCode = '\topacity: ' + opacity + '\n';
  }

  var copy = newLayerCode + backgroundColorCode + borderRadiusCode + borderStyleCode + shadowCode + opacityCode + '\n';

  return copy;
}

function textLayerCode(layer) {
  var name = camelize(layer.name());

  var x = layer.absoluteRect().rulerX() * scale;
  var y = layer.absoluteRect().rulerY() * scale;

  var text = layer.stringValue()
  var fontSize = layer.fontSize() * scale
  var fontFamily = layer.font().familyName()
  var lineHeight = layer.lineHeight() * scale / fontSize
  var color = layer.textColor()
  var textBehaviour = layer.textBehaviour()
  var characterSpacing = layer.characterSpacing() * scale;
  var characterSpacingNum = Number(characterSpacing).toFixed(1);

  var widthCode = ""
  // if text is fixed width
  if (textBehaviour == 1) {
    var width = layer.frame().width() * scale;
    widthCode = '\twidth: ' + width + '\n';
  }

  var textAlignCode
  switch(layer.textAlignment()) {
    case 1:
      textAlignCode = '\ttextAlign: "right"\n';
      break;
    case 2:
      textAlignCode = '\ttextAlign: "center"\n';
      break;
    default:
      textAlignCode = '\ttextAlign: "left"\n';
  }

  var newLayerCode = name + ' = new TextLayer\n' + '\tx: ' + x + '\n' + '\ty: ' + y + '\n' + widthCode + '\ttext: "' + text + '"\n';
  newLayerCode = newLayerCode + '\tfontSize: ' + fontSize + '\n' + '\tfontFamily: "' + fontFamily + '"\n';

  var fontStyleCode = "";
  var fontStyle = getFontStyle(layer);
  if (fontStyle.slope != "") {
    fontStyleCode = fontStyleCode + '\tfontStyle: "' + fontStyle.slope + '"\n';
  }
  if (fontStyle.weight != "") {
    fontStyleCode = fontStyleCode + '\tfontWeight: ' + fontStyle.weight + '\n';
  }

  var letterSpacingCode = "";
  if (characterSpacing != null) {
    letterSpacingCode = '\tletterSpacing: ' + characterSpacingNum + '\n';
  }

  var lineHeightCode = ""
  if (lineHeight != 0) {
    lineHeightCode = '\tlineHeight: ' + lineHeight + '\n';
  }

  var shadowCode = "", opacityCode = "";

  var colorCode = '\tcolor: ' + rgbaCode(color) + '\n';

  var shadow = topShadow(layer.style());
  if (shadow != null) {
    var shadowColor = shadow.colorGeneric();
    var shadowX = shadow.offsetX() * scale;
    var shadowY = shadow.offsetY() * scale;
    var shadowBlur = shadow.blurRadius() * scale;

    shadowCode = '\tshadowColor: ' + rgbaCode(shadowColor) + '\n';
    shadowCode = shadowCode + '\tshadowX: ' + shadowX + '\n';
    shadowCode = shadowCode + '\tshadowY: ' + shadowY + '\n';
    shadowCode = shadowCode + '\tshadowBlur: ' + shadowBlur + '\n';
  }

  var opacity = layer.style().contextSettings().opacity();
  if (opacity != 1) {
    opacityCode = '\topacity: ' + opacity + '\n';
  }

  var copy = newLayerCode + fontStyleCode + letterSpacingCode + lineHeightCode + textAlignCode + colorCode + shadowCode + opacityCode + '\n';

  return copy;
}

function layerCode(layer) {
  var name = camelize(layer.name());

  var x = layer.absoluteRect().rulerX() * scale;
  var y = layer.absoluteRect().rulerY() * scale;
  var width = layer.frame().width() * scale;
  var height = layer.frame().height() * scale;

  var copy = name + ' = new Layer\n' + '\tx: ' + x + '\n' + '\ty: ' + y + '\n' + '\twidth: ' + width + '\n' + '\theight: ' + height + '\n\n';

  return copy;
}

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
