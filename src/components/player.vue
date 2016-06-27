<template>
  <div v-bind:class="{'has-video': currentVideo}" class="video-view">
    <div v-if="showPreview" class="preview">
        <h4>{{ currentVideo.performer }} is perfoming</h2>
        <h1>{{ currentVideo.song.title }}
    </div>

    <div class="video-container">
      <div id="mainPlayer"></div>
    </div>

    <h1 class="no-videos">Put some songs in!</h1>
  </div>
</template>

<script>
  import log from '../helpers/log.js';
  import YoutubeIframeLoader from 'youtube-iframe';

  export default {
    computed: {
      showPreview() {
        return !this.isPlaying && this.currentVideo;
      }
    },
    data() {
      return {
        isPlaying: false,
        player: null,
        videoTimer: null
      }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    ready() {
      YoutubeIframeLoader.load(this.setPlayer);
    },
    watch: {
      'videos[0]'(newVal, oldVal) {
        // If player isn't ready yet, return
        if(!this.player) {
          return;
        }

        var currentVideo = this.videos[0];

        // Current video should be the first item.
        // When a new video is loaded, the first one is removed.
        // Therefore, the first items should be different from
        // the newVal[0] and oldVal[0]
        if(currentVideo && newVal !== oldVal) {
          this.db.ref().update({isPlaying: false});
          this.db.ref().update({videoPosition: 0});

          this.player.cueVideoById(currentVideo.song.id);

          if(this.videos.length > 0) {
            // Show preview for 10 seconds before playing video
            setTimeout(() => {
              // Update Firebase with playback status
              this.db.ref().update({isPlaying: true});
            }, 10000);
          }
        } else if(!currentVideo && !this.videos.length){
          // If there's no video, just stop
          // Update Firebase with playback status
          this.db.ref().update({isPlaying: false});

          this.player.stopVideo();
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
        this.isPlaying = snapshot.val();

        if(this.isPlaying) {
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

          this.db.ref('isPlaying').on('value', (snapshot) => {
            if(!snapshot.val()) {
              this.player.pauseVideo();
            }
          })
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
        switch(e.data) {
          case 1: //playing
            this.trackTime();
            break;
          case 0: //ended
            this.playNext();
            clearInterval(this.videoTimer);
            break;
          default:
            clearInterval(this.videoTimer);
        }
      },
      /**
       * playNext() plays next video in queue
       */
      playNext() {
        this.db.ref().update({videoPosition: 0});

        if(!this.currentVideo) {
          return;
        }

        var key = this.currentVideo.key;

        if(this.videos.length === 1) {
          // Update Firebase with playback status
          this.db.ref().update({isPlaying: false});
        }

        // remove first item in array
        this.db.ref('queue/' + key).remove(() => log('%c removed', 'color: red', key));
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
            start: 0,
            loop: 0
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
          if(position > 10) {
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
            // reset player
            this.db.ref().update({videoPosition: 0});
            this.db.ref().update({isPlaying: false});

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
          this.videoTimer = setInterval(() => {
            this.db.ref().update({
              videoPosition: parseInt(this.player.getCurrentTime(), 10)}
            );
          },1000);
        });
      },
    }
  }
</script>

<style lang="sass" scoped>
  .preview {
    align-items: center;
    background: black;
    color: #ba68c8;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    padding: 18%;
    position: fixed;
    text-align: center;
    width: 100vw;
    z-index: 100;

    h1, h2, h3, h4, h5 {
      font-weight: 200;
    }
  }

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
    color: #ec407a;
    font-weight: 200;
    height: 100vh;
    justify-content: center;
    margin-top: 0;
    text-align: center;
  }

  .video-view {
    height: 100vh;
    background: black;
    width: 100vw;
  }
</style>
