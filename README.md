## Peanuts Pictures

Source images for the TidByt app I built for a friend

The pictures here can be used with https://www.pixilart.com/ to quickly get going if you want
to modify any of the ones I've already created.

-----

So uh, yeah you can autogen the whole script now

Add your new image to `images/your/path`, then add it's pretty name and path to `scripts/source_images.yml`.
Then just run

```bash
node scripts/gen-starlark-script.js
```

And it'll dump out `peanutspictures.star` ready to go, just run

```
pixlet lint --fix apps/peanutspictures/peanuts_pictures.star
```

Before you try to ship and make sure the thing runs with

```
pixlet serve apps/peanutspictures/peanuts_pictures.star
```