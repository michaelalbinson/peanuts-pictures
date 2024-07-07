"""
Applet: $$APPLET_NAME$$
Summary: $$APPLET_SUMMARY$$
Description: $$APPLET_DESCRIPTION$$
Author: $$APPLET_AUTHOR$$
"""

load("encoding/base64.star", "base64")
load("random.star", "random")
load("render.star", "render")
load("schema.star", "schema")

DEFAULT_SPEED = 500
OPT_RANDOM = "random"
$$FILL_OPT_DECLARATIONS$$
all_opts = [
    $$FILL_OPT_ARRAY$$
]

def main(config):
    image_opt = config.get("image")
    if image_opt == OPT_RANDOM or image_opt == None:
        image_opt = all_opts[random.number(0, len(all_opts) - 1)]

    $$FILL_DELAY_BRANCHES$$

    $$FILL_BRANCHES$$
    else:
        fail("Couldn't find an image to render")

    return render.Root(
        delay = int(delay),
        child = render.Image(base64.decode(img_to_display)),
    )

$$FILL_FUNCTIONS$$

def get_schema():
    options = [
        schema.Option(
            display = "Random",
            value = OPT_RANDOM,
        ),
        $$FILL_OPTIONS$$
    ]

    return schema.Schema(
        version = "1",
        fields = [
            schema.Dropdown(
                id = "image",
                name = "Image",
                desc = "The image to display",
                icon = "bolt",
                default = options[0].value,
                options = options,
            ),
        ],
    )
