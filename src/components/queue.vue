<template>
  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 2rem; right: 2rem;"
      v-link="'/search'">
      <i class="material-icons">search</i>
    </a>
  </div>

  <ul v-if="videos.length" class="collection">
    <li v-for="video in videos" track-by=".key" class="collection-item">
        {{ video.song.title }}
    </li>
  </ul>

  <div class="no-songs center" v-if="!videos.length">
    <p>No videos are in queue.<p>
    <a class="btn" v-link="'/search'">Let's do this!</a>
  </div>
</template>

<script>
  import firebaseMixin from '../mixins/firebase';
  import log from '../helpers/log';

  export default {
    props: [
      'firebaseRef'
    ],
    mixins: [firebaseMixin],
    data() {
      return {
        videos: {
          source: this.firebaseRef.database().ref('queue')
        }
      }
    },
    ready() {
      // Check how many videos we have
      setTimeout(() => log('%c videos in queue', 'color: coral', this.videos), 1200);
    }
  }
</script>
