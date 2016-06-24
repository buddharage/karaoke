<template>
  <div class="navbar-fixed" v-if="videos.length">
    <nav class="controls center white z-depth-1">
      <button v-on:click.prevent="replayVideo" class="btn-floating btn-medium waves-effect waves-light transparent z-depth-0">
        <i class="material-icons">replay</i>
      </button>

      <button v-on:click.prevent="togglePlayback" class="btn-floating btn-large waves-effect waves-light pink lighten-2">
        <i v-if="isPlaying" class="material-icons">pause</i>
        <i v-else class="material-icons">play_arrow</i>
      </button>

      <button v-on:click.prevent="skipVideo" class="btn-floating btn-medium waves-effect waves-light transparent z-depth-0">
        <i class="material-icons">skip_next</i>
      </button>
    </nav>
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
      this.db.ref('isPlaying').on('value', (snapshot) => {
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
  nav i.material-icons {
    color: black;
    height: auto;
    line-height: 1em;
  }


  button {
    margin: 0 3%;
  }
</style>
