# at-home-mobile

The mobile part of [AtHome](https://github.com/jean553/at-home).

## Build the dev environment

```sh
vagrant up
```

## Connect to the dev environment

```sh
vagrant ssh
```

## Set the destination URL

Open `global.js` and set the correct server URL:

```js
global.baseUrl = "http://api.your-url.com";
```

## Expo login

You must be logged in to Expo in order to use correctly the push notification token.

```sh
expo login
```

## Start Expo

```sh
expo start
```

## Credits

 * Flag map icon from https://material.io/tools/icons/?icon=flag&style=baseline / Apache License 2.0
