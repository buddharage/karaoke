<template>
  <controls v-if="videos.length"
    :db="db"
    :videos="videos"
    :current-video="currentVideo"
    ></controls>

  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 1%; right: 1%;"
      v-link="'/search'">
      <i class="material-icons">search</i>
    </a>
  </div>

  <ul v-if="videos && videos.length" class="collection">
    <li v-for="video in videos" track-by="key" transition="append" class="collection-item">
        {{ video.performer }} - {{ video.song.title }}
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
      'currentVideo',
      'db',
      'videos'
    ],
    ready() {
      // Check how many videos we have
      setTimeout(() => log('%c videos in queue', 'color: coral', this.videos), 800);
    }
  }
</script>

<style lang="sass" scoped>
  /** Custom VueJS animations **/
  .append-transition {
    opacity: 1;
    perspective: 100px;
    transform: none;
    transition: transform 0.5s cubic-bezier(.36,-0.64,.34,1.76);
  }

  .append-enter,
  .append-leave {
    opacity: 0;
    transform: rotateX(-90deg);
  }
  /** End Animations **/
</style>
