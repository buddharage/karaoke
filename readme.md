Use the biggest karaoke video library, Youtube, to queue up and play karaoke!

## Installation

1. Clone the repo
2. Run `npm install`
3. Edit and save the `config.sample.js` as `config.js` with your own values

To run development, run `npm run dev`

To build, run `npm run build`

VueJS object properties are always in alphabetical order with the exception of `methods` which is always last.

## Usage

### For singers
Go to `/queue` to see what songs are next.

Click **search** to go to `/search` and find a song. Then add it to the queue!

### For host
Go to `/player` to display the video

## Firebase binding

To bind a VueJS data property to Firebase, use the following object as the data's value:

```javascript
var firebaseBindingObj = {
  source: this.firebaseRef.database().ref('queue'),
  asObject: false,
  cancelCallback() {
    // Execute when Firebase cancels the request (e.g. permission error)
  }
};
```

Example:

```javascript
var component = Vue.extend({
  props: [],
  mixins: [],
  data() {
    return {
      videos: {
        source: this.firebaseRef.database().ref('queue')
      }
    }
  },
  ready() {}
});
```

If the data value does not follow the preceding object syntax, then it will be read as a regular VueJS data value.

### Main Libraries used

* [VueJS](https://vuejs.org/)
* [VueJS Router](http://router.vuejs.org/)
* [Firebase](https://www.firebase.com/)
* [Firebase mixin based on VueFire](https://github.com/vuejs/vuefire)
* [Webpack](https://webpack.github.io/)
* [MaterializeCSS](http://materializecss.com/)
