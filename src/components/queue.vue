<template>
  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 2rem; right: 2rem;"
      v-link="'/search'">
      <i class="material-icons">search</i>
    </a>
  </div>

  <ul v-if="videos" class="collection">
    <li v-for="video in videos" class="collection-item">
        {{ video.title }}
    </li>
  </ul>

  <div class="no-songs center" v-if="!videos">
    <p>No videos are in queue.<p>
    <a class="btn" v-link="'/search'">Let's do this!</a>
  </div>
</template>

<script>
  import config from '../../config';
  import Firebase from 'firebase';

  var queueRef = new Firebase(config.firebaseURL + '/room/queue');

  export default {
    data() {
      return {
        videos: []
      }
    },
    ready() {
      this.$bindAsObject('videos', queueRef);
      console.log('videos', this.videos);
    }
  }
</script>
