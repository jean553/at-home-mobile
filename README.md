# at-home-mobile

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

## Start Expo

```sh
yarn start
```

## Credits

 * Flag map icon from https://material.io/tools/icons/?icon=flag&style=baseline / Apache License 2.0
