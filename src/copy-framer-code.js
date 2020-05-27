import Document from "sketch/dom"
import UI from "sketch/ui"

var layerNames = {}
var framerLayers = []
var scale = 1

export default function () {
    scale = 1
    copyFramerCode()
}

export function onCopyAt2x() {
    scale = 2
    copyFramerCode()
}

export function onCopyAt3x() {
    scale = 3
    copyFramerCode()
}

////////////////////////////////////////////////////////////////////////////////

function copyFramerCode() {
    var selection = Document.getSelectedDocument().selectedLayers

    if (selection.isEmpty) {
        UI.message("Select one or more layers to copy")
        return false
    }

    selection.forEach(function (layer) {
        processLayerRecursively(layer)
    })

    var i,
        len,
        clipboardText = ""
    for (i = 0, len = framerLayers.length; i < len; i++) {
        clipboardText =
            clipboardText + framerLayerProperties(framerLayers[i]) + "\n"
    }

    if (clipboardText != "") {
        UI.message("Copying @ " + scale + "x")
        clipboard.set(clipboardText)
    } else {
        UI.message("Fail :(")
    }
}

////////////////////////////////////////////////////////////////////////////////

var processLayerRecursively = function (layer, parent) {
    var sketchObject = layer.sketchObject

    if (sketchObject.isVisible() && sketchObject.class() != MSSliceLayer) {
        var framerObject = {}

        framerObject.layerType = "Layer"

        var name = camelize(sketchObject.name())
        name = uniqueLayerName(name)
        framerObject.name = name

        if (layer.type === "Artboard") {
            framerObject.x = 0
            framerObject.y = 0
        } else if (parent == null) {
            framerObject.x = sketchObject.absoluteRect().rulerX() * scale
            framerObject.y = sketchObject.absoluteRect().rulerY() * scale
        } else {
            framerObject.parent = parent
            framerObject.x = sketchObject.frame().x() * scale
            framerObject.y = sketchObject.frame().y() * scale
        }

        var isFlattenedGroup = sketchObject.name().slice(-1) == "*"

        if (layer.type === "Group" || layer.type === "Artboard") {
            if (isFlattenedGroup) {
                Object.assign(framerObject, layerCode(sketchObject))
                framerLayers.push(framerObject)
            } else {
                framerObject.backgroundColor = '"transparent"'
                Object.assign(framerObject, layerCode(sketchObject))
                framerLayers.push(framerObject)

                layer.layers.forEach(function (layer) {
                    processLayerRecursively(layer, name)
                })
            }
        } else if (layer.type === "ShapePath") {
            if (layer.shapeType === "Rectangle" || layer.shapeType === "Oval") {
                Object.assign(framerObject, layerWithPropertiesCode(layer))
            } else {
                Object.assign(framerObject, layerCode(sketchObject))
            }

            framerLayers.push(framerObject)
        } else if (layer.type === "Text") {
            framerObject.layerType = "TextLayer"
            Object.assign(framerObject, textLayerCode(sketchObject))
            framerLayers.push(framerObject)
        } else {
            Object.assign(framerObject, layerCode(sketchObject))
            framerLayers.push(framerObject)
        }
    }
}

////////////////////////////////////////////////////////////////////////////////

function layerWithPropertiesCode(layer) {
    let sketchObject = layer.sketchObject
    var framerObject = {}

    framerObject.width = sketchObject.frame().width() * scale
    framerObject.height = sketchObject.frame().height() * scale

    var fill = topFill(sketchObject.style())
    if (fill == null) {
        framerObject.backgroundColor = '"transparent"'
    } else {
        framerObject.backgroundColor = rgbaCode(fill.color())
    }

    var borderRadius
    if (layer.shapeType === "Oval") {
        borderRadius = framerObject.width / 2
    } else {
        borderRadius = layer.points[0].cornerRadius * scale
    }

    if (borderRadius != 0) {
        framerObject.borderRadius = borderRadius
    }

    var border = topBorder(sketchObject.style())
    if (border != null) {
        framerObject.borderColor = rgbaCode(border.color())
        framerObject.borderWidth = border.thickness() * scale
    }

    var shadow = topShadow(sketchObject.style())
    if (shadow != null) {
        framerObject.shadowColor = rgbaCode(shadow.color())
        framerObject.shadowX = shadow.offsetX() * scale
        framerObject.shadowY = shadow.offsetY() * scale
        framerObject.shadowBlur = shadow.blurRadius() * scale
        framerObject.shadowSpread = shadow.spread() * scale
    }

    var opacity = sketchObject.style().contextSettings().opacity()
    if (opacity != 1) {
        framerObject.opacity = opacity
    }

    return framerObject
}

//------------------------------------------------------------------------------

function textLayerCode(layer) {
    var framerObject = {}

    // if text is fixed width
    if (layer.textBehaviour() == 1) {
        framerObject.width = layer.frame().width() * scale
    }

    framerObject.text = '"' + layer.stringValue() + '"'
    framerObject.fontSize = layer.fontSize() * scale
    framerObject.fontFamily = '"' + layer.font().familyName() + '"'

    var fontStyle = getFontStyle(layer)
    if (fontStyle.slope != "") {
        framerObject.fontStyle = fontStyle.slope
    }

    if (fontStyle.weight != "") {
        framerObject.fontWeight = fontStyle.weight
    }

    if (layer.characterSpacing() != null) {
        framerObject.letterSpacing = (layer.characterSpacing() * scale).toFixed(
            1
        )
    }

    if (layer.lineHeight() != 0) {
        framerObject.lineHeight =
            (layer.lineHeight() * scale) / framerObject.fontSize
    }

    switch (layer.textAlignment()) {
        case 1:
            framerObject.textAlign = '"right"'
            break
        case 2:
            framerObject.textAlign = '"center"'
            break
        default:
            framerObject.textAlign = '"left"'
    }

    if (layer.styleAttributes().NSStrikethrough == 1) {
        framerObject.textDecoration = '"line-through"'
    }

    if (layer.styleAttributes().NSUnderline == 1) {
        framerObject.textDecoration = '"underline"'
    }

    if (layer.styleAttributes().MSAttributedStringTextTransformAttribute == 1) {
        framerObject.textTransform = '"uppercase"'
    }

    if (layer.styleAttributes().MSAttributedStringTextTransformAttribute == 2) {
        framerObject.textTransform = '"lowercase"'
    }

    framerObject.color = rgbaCode(layer.textColor())

    var shadow = topShadow(layer.style())
    if (shadow != null) {
        framerObject.shadowColor = rgbaCode(shadow.color())
        framerObject.shadowX = shadow.offsetX() * scale
        framerObject.shadowY = shadow.offsetY() * scale
        framerObject.shadowBlur = shadow.blurRadius() * scale
    }

    var opacity = layer.style().contextSettings().opacity()
    if (opacity != 1) {
        framerObject.opacity = opacity
    }

    return framerObject
}

//------------------------------------------------------------------------------

function layerCode(layer) {
    var framerObject = {}

    framerObject.width = layer.frame().width() * scale
    framerObject.height = layer.frame().height() * scale

    function findFormatMatchingScale(exportFormat) {
        return exportFormat.scale() === scale
    }

    var imageFilename = fileNameFromPath(layer.name())
    var exportFormats = layer.exportOptions().exportFormats()

    if (exportFormats.length != 0) {
        var matchingExportFormat = exportFormats.find(findFormatMatchingScale)
        if (matchingExportFormat == null) {
            matchingExportFormat = exportFormats[0]
        }

        var imageExtn = matchingExportFormat.fileFormat()
        if (matchingExportFormat.name() != null) {
            if (matchingExportFormat.namingScheme() == 0) {
                imageFilename = imageFilename + matchingExportFormat.name()
            } else {
                imageFilename = matchingExportFormat.name() + imageFilename
            }
        }

        framerObject.image = '"images/' + imageFilename + "." + imageExtn + '"'
    }

    var opacity = layer.style().contextSettings().opacity()
    if (opacity != 1) {
        framerObject.opacity = opacity
    }

    return framerObject
}

////////////////////////////////////////////////////////////////////////////////

function framerLayerProperties(object) {
    var text
    if (object.layerType == "TextLayer") {
        text = object.name + " = new TextLayer\n"
    } else {
        text = object.name + " = new Layer\n"
    }

    Object.keys(object).forEach(function (key) {
        if (key != "layerType" && key != "name") {
            text = text + "\t" + key + ": " + object[key] + "\n"
        }
    })

    return text
}

////////////////////////////////////////////////////////////////////////////////

function topFill(style) {
    var fills = style.enabledFills()

    var i,
        len,
        fill = null
    for (i = 0, len = fills.length; i < len; i++) {
        var fillType = fills[i].fillType()
        if (fillType == 0) {
            fill = fills[i]
        }
    }

    return fill
}

function topBorder(style) {
    var borders = style.enabledBorders()

    var i,
        len,
        border = null
    for (i = 0, len = borders.length; i < len; i++) {
        var fillType = borders[i].fillType()
        if (fillType == 0) {
            border = borders[i]
        }
    }

    return border
}

function topShadow(style) {
    var shadows = style.enabledShadows()
    var len = shadows.length

    if (len == 0) {
        return null
    } else {
        return shadows[len - 1]
    }
}

////////////////////////////////////////////////////////////////////////////////

function rgbaCode(colour) {
    var red = Math.round(colour.red() * 255)
    var green = Math.round(colour.green() * 255)
    var blue = Math.round(colour.blue() * 255)

    return (
        '"rgba(' + red + "," + green + "," + blue + "," + colour.alpha() + ')"'
    )
}

function getFontStyle(layer) {
    var fontWeights = {
        thin: 100,
        extralight: 200,
        ultralight: 200,
        light: 300,
        book: 400,
        normal: 400,
        regular: 400,
        roman: 400,
        medium: 500,
        semibold: 600,
        demibold: 600,
        bold: 700,
        boldmt: 700,
        psboldmt: 700,
        extrabold: 800,
        ultrabold: 800,
        black: 900,
        heavy: 900,
    }

    var fontFamily = layer.font().familyName().replace(/ /g, "")
    var fontName = layer.fontPostscriptName().replace(/-/g, "")
    var val = fontName.replace(fontFamily, "").toLowerCase()

    var fontWeight = "",
        fontSlope = ""

    if (val.includes("italic")) {
        fontSlope = '"italic"'
        val = val.replace("italic", "")
    }

    if (val.includes("oblique")) {
        fontSlope = '"oblique"'
        val = val.replace("oblique", "")
    }

    if (fontWeights[val] != undefined) {
        fontWeight = fontWeights[val]
    }

    return { weight: fontWeight, slope: fontSlope }
}

////////////////////////////////////////////////////////////////////////////////

function camelize(str) {
    str = str.replace(/-/g, " ")
    str = str.replace(/[^a-zA-Z0-9$_ ]/g, "")
    str = str.trim()
    if (str == "") {
        str = "layer"
    } else if (firstCharIsInvalid(str)) {
        str = "layer_" + str
    }
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return "" // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toLowerCase() : match.toUpperCase()
    })
}

function firstCharIsInvalid(str) {
    return str.charAt(0).match(/[^a-z$_]/i)
}

function uniqueLayerName(name) {
    if (layerNames[name] > 0) {
        var count = ++layerNames[name]
        return name + "_" + count
    } else {
        layerNames[name] = 1
        return name
    }
}

function fileNameFromPath(str) {
    return str.split("/").pop().trim()
}

////////////////////////////////////////////////////////////////////////////////

// Using JSTalk clipboard handling snippet from https://gist.github.com/uhunkler/5465857 by Urs Hunkler
var clipboard = {
    // store the pasetboard object
    pasteBoard: null,

    // save the pasteboard object
    init: function () {
        this.pasteBoard = NSPasteboard.generalPasteboard()
    },
    // set the clipboard to the given text
    set: function (text) {
        if (typeof text === "undefined") return null

        if (!this.pasteBoard) this.init()

        this.pasteBoard.declareTypes_owner([NSPasteboardTypeString], null)
        this.pasteBoard.setString_forType(text, NSPasteboardTypeString)

        return true
    },
    // get text from the clipbaoard
    get: function () {
        if (!this.pasteBoard) this.init()

        var text = this.pasteBoard.stringForType(NSPasteboardTypeString)

        return text.toString()
    },
}
