<template>
  <div class="controls center">
    <button v-on:click.prevent="replayVideo" class="btn-floating btn-medium waves-effect waves-light">
      <i class="material-icons">replay</i>
    </button>

    <button v-on:click.prevent="togglePlayback" class="btn-floating btn-large waves-effect waves-light">
      <i v-if="isPlaying" class="material-icons">pause</i>
      <i v-else class="material-icons">play_arrow</i>
    </button>

    <button v-on:click.prevent="skipVideo" class="btn-floating btn-medium waves-effect waves-light">
      <i class="material-icons">skip_next</i>
    </button>
  </div>
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

<style scoped>
  .controls {
    padding: 5% 0;
  }

  button {
    margin: 0 2%;
  }
</style>
