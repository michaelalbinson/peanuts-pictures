'use strict';

const {readFileSync, writeFileSync, existsSync} = require('fs');
const {join} = require('path');
const { parse } = require('yaml');

const TMP_FILL_OPT_DECLARATIONS = '$$FILL_OPT_DECLARATIONS$$';
const TMP_FILL_OPTS_ARRAY = '$$FILL_OPT_ARRAY$$';
const TMP_FILL_BRANCHES = '$$FILL_BRANCHES$$';
const TMP_FILL_FUNCTIONS = '$$FILL_FUNCTIONS$$';
const TMP_FILL_OPTIONS = '$$FILL_OPTIONS$$';
const TMP_FILL_APP_NAME = '$$APPLET_NAME$$';
const TMP_FILL_APP_SUMMARY = '$$APPLET_SUMMARY$$';
const TMP_FILL_APP_DESCRIPTION = '$$APPLET_DESCRIPTION$$';
const TMP_FILL_APP_AUTHOR = '$$APPLET_AUTHOR$$';

//////////////// FUNCTIONS ////////////////

const getOptDeclarations = sourceImages => {
    return sourceImages.map(it => {
        return `${it.optionName} = "${it.displayName}"`;
    }).join('\n').trim();
}

const getOptArray = sourceImages => {
    return sourceImages.map(it => {
        return `\t${it.optionName},`;
    }).join('\n').trim();
}

const getConditions = sourceImages => {
    return sourceImages
        .map(it => {
            return `\telif OPT_${it.machineName.toUpperCase()} == image_opt:\n\t\timg_to_display = ${it.machineName}()`;
        })
        .join('\n')
        .slice(3); // slice off the first '\tel'
}

const getFunctions = sourceImages => {
    return sourceImages.map(getStarlarkImgFunction).join('\n\n');
}

const getSchemaOptions = sourceImages => {
    return sourceImages
        .map(it => {
            return `\t\tschema.Option(\n\t\t\tdisplay = "${it.displayName}",\n\t\t\tvalue = ${it.optionName},\n\t\t),`
        })
        .join('\n')
        .slice(2);
}

const getStarlarkImgFunction = sourceImage => {
    return `def ${sourceImage.machineName}():\n\treturn """\n${sourceImage.base64Data}\n"""`;
}


const getBase64Data = filePath => {
    return readFileSync(filePath)
        .toString('base64')
        .replace(/.{100}/g, '$&\n'); // makes the data more readable
}

//////////////// MARK: SCRIPT START ////////////////

const config = parse(readFileSync(join(__dirname, '..', 'source_images.yaml')).toString());
const sourceImages = config.images
    .map(it => {
        const displayName = Object.keys(it)[0];
        const path = Object.values(it)[0];
        const filePath = join(__dirname, '..', 'images', path);
        if (!existsSync(filePath)) {
            console.error(`Could not find image file at path: ${filePath}`);
            process.exit(1);
        }

        const machineName = displayName.toLowerCase().replaceAll(' ', '_');
        return {
            displayName,
            machineName,
            optionName: 'OPT_' + machineName.toUpperCase(),
            path: it[1],
            base64Data: getBase64Data(filePath)
        }
    });

console.log(`Found ${sourceImages.length} images to process`);

const template =
    readFileSync(join(__dirname, 'template_starlark/template.star'))
        .toString()
        .replace(TMP_FILL_OPT_DECLARATIONS, getOptDeclarations(sourceImages))
        .replace(TMP_FILL_OPTS_ARRAY, getOptArray(sourceImages))
        .replace(TMP_FILL_BRANCHES, getConditions(sourceImages))
        .replace(TMP_FILL_FUNCTIONS, getFunctions(sourceImages))
        .replace(TMP_FILL_OPTIONS, getSchemaOptions(sourceImages))
        .replace(TMP_FILL_APP_NAME, config.name)
        .replace(TMP_FILL_APP_SUMMARY, config.summary)
        .replace(TMP_FILL_APP_DESCRIPTION, config.desc)
        .replace(TMP_FILL_APP_AUTHOR, config.author);

writeFileSync(join(__dirname, config.fileName), template);

console.log(`Successfully generated starlark script!`);