<template>
  <controls v-if="videos.length"
    :db="db"
    :firebase-ref="firebaseRef"
    :videos="videos"
    ></controls>

  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 2rem; right: 2rem;"
      v-link="'/search'">
      <i class="material-icons">search</i>
    </a>
  </div>

  <ul v-if="videos && videos.length" class="collection">
    <li v-for="video in videos" track-by="key" class="collection-item">
        {{ video.song.title }}
    </li>
  </ul>

  <div v-else class="no-songs center">
    <p>No videos are in queue.<p>
    <a class="btn" v-link="'/search'">Let's do this!</a>
  </div>
</template>

<script>
  import controls from './controls.vue';
  import log from '../helpers/log';

  export default {
    components: {
      'controls': controls
    },
    props: [
      'db',
      'firebaseRef',
      'videos'
    ],
    ready() {
      // Check how many videos we have
      setTimeout(() => log('%c videos in queue', 'color: coral', this.videos), 1200);
    }
  }
</script>
