<template>
  <nav class="controls center grey darken-4">
    <button v-on:click.prevent="replayVideo" class="btn-floating btn-medium waves-effect waves-light grey darken-1">
      <i class="material-icons">replay</i>
    </button>

    <button v-on:click.prevent="togglePlayback" class="btn-floating btn-large waves-effect waves-light pink ligthen-1">
      <i v-if="isPlaying" class="material-icons">pause</i>
      <i v-else class="material-icons">play_arrow</i>
    </button>

    <button v-on:click.prevent="skipVideo" class="btn-floating btn-medium waves-effect waves-light grey darken-1">
      <i class="material-icons">skip_next</i>
    </button>
  </nav>
</template>

<script>
  import log from '../helpers/log';

  export default {
    data() {
      return {
        isPlaying: false
      }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    ready() {
      // Set playback status
      this.db.ref('isPlaying').once('value').then((snapshot) => {
          this.isPlaying = snapshot.val();
      });
    },
    methods: {
      replayVideo() {
        // Update Firebase with playback status
        this.db.ref().update({videoPosition: 0});
      },
      skipVideo() {
        if(!this.currentVideo) {
          return;
        }

        var key = this.currentVideo.key;

        // remove first item in array
        this.db.ref('queue/' + key).remove(() => log('%c removed', 'color: red', key));
      },
      togglePlayback() {
        // Toggle isPlaying
        this.isPlaying = !this.isPlaying;

        // Update Firebase with playback status
        this.db.ref().update({isPlaying: this.isPlaying});
      }
    },
  }
</script>

<style lang="sass" scoped>
  .controls {
    height: auto;
    padding: 5% 0;
  }

  nav i.material-icons {
    height: auto;
    line-height: 1em;
  }

  button {
    margin: 0 3%;
  }
</style>
