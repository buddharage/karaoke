<template>
  <div class="main">
    <router-view
      :current-video="currentVideo"
      :db="db"
      :videos="videos"
      ></router-view>
  </div>
</template>

<script>
  import config from '../config';
  import Firebase from 'firebase/app';
  import firebaseMixin from './mixins/firebase';
  import 'firebase/database';
  import log from './helpers/log.js';

  var firebaseRef = Firebase.initializeApp(config.firebase);

  export default {
    mixins: [firebaseMixin],
    replace: false,
    computed: {
      currentVideo() {
        if(this.videos.length) {
          log('%c Currently playing: %c %s', 'color: aquamarine', 'color: coral', this.videos[0].song.title);
        }
        return this.videos[0];
      }
    },
    data() {
      return {
        db: firebaseRef.database(),
        videos: {
          source: firebaseRef.database().ref('queue')
        }
      }
    }
  }
</script>
