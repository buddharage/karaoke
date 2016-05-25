<template>
  <div v-bind:class="{'has-video': currentVideo}" class="video-view">
    <div class="video-container">
      <div id="mainPlayer"></div>
    </div>

    <h1 class="no-videos">Put some songs in!</h1>
  </div>
</template>

<script>
  import firebaseMixin from '../mixins/firebase';
  import log from '../helpers/log.js';
  import YoutubeIframeLoader from 'youtube-iframe';

  export default {
    computed: {
        currentVideo() {
          return this.videos[0];
        }
    },
    data() {
      return {
        db: this.firebaseRef.database(),
        player: null,
        videoTimer: null
      }
    },
    mixins: [
      firebaseMixin
    ],
    props: [
      'firebaseRef',
      'videos'
    ],
    ready() {
      YoutubeIframeLoader.load(this.setPlayer);

      // Check how many videos we have
      setTimeout(() => log('%c videos in queue', 'color: coral', this.videos), 1200);
    },
    watch: {
      videos(newVal, oldVal) {
        // Current video should be the first item
        // If it's different, load next video
        if(newVal[0] !== oldVal[0]) {
          if(this.currentVideo) {
            log('onQueueChildRemoved - loading next video');
            this.player.cueVideoById(this.currentVideo.song.id);
          } else {
            // If there's no video, just stop
            log('onQueueChildRemoved - stopping current video');
            this.player.stopVideo();
          }
        }

        if(newVal.length > 0 && oldVal.length === 0) {
          log('onQueueChildRemoved - play video when there were no videos before');
          this.player.cueVideoById(this.currentVideo.song.id);
        }
      }
    },
    methods: {
      /**
       * onPlaybackChange() binds the Firebase `isPlaying` value to
       * determine if player should play or pause
       * @param  {Object} snapshot  Firebase data
       */
      onPlaybackChange(snapshot) {
        log('playback change',snapshot.val());
        var isPlaying = snapshot.val();

        if(isPlaying) {
          this.player.playVideo();
        } else if (this.player.getPlayerState() === 1) {
          // Pause video only if video is playing
          this.player.pauseVideo();
        }
      },
      /**
       * onPositionChange() handles when player is playing
       * @param  {Object} snapshot  Firebase object
       */
      onPositionChange(snapshot) {
        var position = snapshot.val();

        if(position === 0) {
          this.player.seekTo(0);
        }
      },
      /**
       * onPlayerReady() initializes after Youtube player loads
       */
      onPlayerReady() {
        // Bind Firebase events to player
        this.db.ref('isPlaying').on('value', this.onPlaybackChange);

        this.db.ref('videoPosition').on('value', this.onPositionChange);
      },
      onPlayerStateChange(e) {
        log('state changing', e.data);

        switch(e.data) {
          case 1: //playing
            this.trackTime();
            break;
          case 0: //ended
            this.playNext();
            clearInterval(this.videoTimer);
            break;
        }
      },
      /**
       * playNext() plays next video in queue
       */
      playNext() {
        if(this.videos) {
          // remove first item in array
          this.db.ref('queue/' + this.videos[0]['key']).remove(() => log('%c removed', 'color: red', this.videos[0]['key']));
        }
      },
      /**
       * setPlayer() sets up the Youtube player
       * @param {Object}  YT  Youtube iframe API object
       */
      setPlayer(YT) {
        var youtubeOpts = {
          playerVars: {
            autoplay: false,
            videoId: 'eFfmE37xLX0',
            controls: 0,
            modestbranding: true,
            rel: 0,
            showinfo: 0,
            start: 0
          },
          events: {
            'onReady': this.onPlayerReady,
            'onStateChange': this.onPlayerStateChange,
          }
        }

        this.db.ref('videoPosition').once('value').then((snapshot) => {
          if(this.currentVideo) {
            // Set the Youtube player to play currentVideo
            youtubeOpts.videoId = this.currentVideo.song.id;
          }

          var position = snapshot.val();

          // Set starting position
          if(position) {
            youtubeOpts.playerVars.start = position;

            // Check if player should be playing
            this.db.ref('isPlaying').once('value').then((snapshot) => {
              // If isPlaying is true, set autoplay to true
              if(snapshot.val()) {
                youtubeOpts.playerVars.autoplay = true;
              }

              // Set up player to #mainPlayer element
              this.player = new YT.Player('mainPlayer', youtubeOpts);
            });
          } else {
            // Set up player to #mainPlayer element
            this.player = new YT.Player('mainPlayer', youtubeOpts);
          }
        });
      },
      /**
       * trackTime() tracks the player position and updates Firebase
       */
      trackTime() {
        // Track time
        this.db.ref('videoPosition').once('value').then((snapshot) => {
          // If videoPosition doesn't exist, reset it to 0
          if(!snapshot.val()){
            this.db.ref().update({videoPosition: 0});
          }

          // Update Firebase with player position
          setTimeout(() => {
            this.videoTimer = setInterval(() => {
              this.db.ref().update({
                videoPosition: parseInt(this.player.getCurrentTime(), 10)}
              );
            },1000);
          }, 100);
        });
      },
    }
  }
</script>

<style lang="sass" scoped>
  .has-video {
      .no-videos {
        display: none;
      }

      .video-container {
        display: block;
      }
  }

  .video-container {
    display: none;
  }

  .no-videos {
    align-items: center;
    display: flex;
    color: coral;
    font-weight: 700;
    height: 100vh;
    justify-content: center;
    margin-top: 0;
  }

  .video-view {
    height: 100vh;
    background: black;
    width: 100vw;
  }
</style>
