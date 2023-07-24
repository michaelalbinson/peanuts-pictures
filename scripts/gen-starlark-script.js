'use strict';

const {readFileSync, writeFileSync, existsSync} = require('fs');
const {join} = require('path');

const TMP_FILL_OPT_DECLARATIONS = '$$FILL_OPT_DECLARATIONS$$';
const TMP_FILL_OPTS_ARRAY = '$$FILL_OPT_ARRAY$$';
const TMP_FILL_BRANCHES = '$$FILL_BRANCHES$$';
const TMP_FILL_FUNCTIONS = '$$FILL_FUNCTIONS$$';
const TMP_FILL_OPTIONS = '$$FILL_OPTIONS$$';

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

const sourceImages = readFileSync(join(__dirname, 'source_images.yml'))
    .toString()
    .split('\n')
    .map(it => it.split(':').map(it => it.trim()))
    .map(it => {
        const filePath = join(__dirname, '..', 'images', it[1]);
        if (!existsSync(filePath)) {
            console.error(`Could not find image file at path: ${filePath}`);
            process.exit(1);
        }

        const machineName = it[0].toLowerCase().replaceAll(' ', '_');
        return {
            displayName: it[0],
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
        .replace(TMP_FILL_OPTIONS, getSchemaOptions(sourceImages));

writeFileSync(join(__dirname, 'peanutspictures.star'), template);