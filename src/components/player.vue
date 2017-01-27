<template>
  <div class="video-view">
    <div class="video-container">
      <div id="mainPlayer"></div>
    </div>

    <div v-show="isIdle" class="idle-player">
      <h1>1-800-happy-birthday-lyd</h1>
      <h1>1-800-happy-birthday-lyd</h1>
      <h1>1-800-happy-birthday-lyd</h1>
      <h1>1-800-happy-birthday-lyd</h1>
      <h1>1-800-happy-birthday-lyd</h1>
      <h4>Add songs @ karaoke.thaivietle.com</h4>
    </div>

    <transition name="zoom" appear>
      <div v-if="showPreview" class="preview">
          <img class="bg" :src="'/images/lydia-' + Math.round(Math.random() * 10) + '.jpg'">
          <h4>{{ currentVideo.performer }} is perfoming</h4>
          <h1>{{ currentVideo.song.title }}
      </div>
    </transition>

    <transition name="zoom" appear>
      <div v-show="!currentVideo && !isIdle" class="no-videos">
        <img class="bg" :src="'/images/lydia-' + Math.round(Math.random() * 10) + '.jpg'">
        <h1>1-800-happy-birthday-lyd</h1>
        <h1>1-800-happy-birthday-lyd</h1>
        <h1>1-800-happy-birthday-lyd</h1>
        <h1>1-800-happy-birthday-lyd</h1>
        <h1>1-800-happy-birthday-lyd</h1>
        <h4>Add songs @ karaoke.thaivietle.com</h4>
      </div>
    </transition>
  </div>
</template>

<script>
  import config from '../../config';
  import log from '../helpers/log.js';
  import YoutubeIframeLoader from 'youtube-iframe';
  import ytApi from 'youtube-api-simple';

  // Set Youtube API object
  var youtube =ytApi({
    api: config.googleKey,
    uri: 'https://www.googleapis.com/youtube/v3/'
  });

  export default {
    name: 'player',
    computed: {
      showPreview() {
        return !this.isPlaying && this.currentVideo;
      }
    },
    data() {
      return {
        isIdle: false,
        isPlaying: false,
        player: null,
        videoTimer: null,
        idlePlaylistId: 'PLz1B0-xw_mY43IV1JM7NaG8OVi5L052jQ',
        idlePlaylistLength: 0
      }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    mounted() {
      YoutubeIframeLoader.load(this.setPlayer);

      // Get idle playlist length
      youtube.playlistItems().list({
        part: 'snippet',
        playlistId: this.idlePlaylistId
      }).then((data) => {
        if(!data) {
          return;
        }

        this.idlePlaylistLength = parseInt(JSON.parse(data).pageInfo.totalResults, 10);
      });
    },
    watch: {
      currentVideo(newVal, oldVal) {
        // If player isn't ready yet, return
        if(!this.player) {
          return;
        }

        var currentVideo = this.currentVideo;

        var isFirstVideo = !oldVal && newVal !== oldVal;

        var isDifferentSong = oldVal && newVal && newVal.song.id !== oldVal.song.id;

        if(currentVideo && (isFirstVideo || isDifferentSong)) {
          log('currentVideo', currentVideo.song.id);
          log('newVal %c', 'color: aquamarine', newVal);
          log('oldVal %c', 'color: aquamaring', oldVal);

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

          this.playIdleVideo();
        }
      }
    },
    methods: {
      /**
       * onPlaybackChange() binds the Firebase `isPlaying` value to
       * determine if player should play or pause
       *
       * @param  {Object} snapshot  Firebase data
       */
      onPlaybackChange(snapshot) {
        this.isPlaying = snapshot.val();

        if (this.isPlaying) {
          log('[player] onPlaybackChange() this.player: ', this.player);

          this.isIdle = false;
          this.player.playVideo();

          log('[player] onPlaybackChange() this.player: ', this.player.getVideoData());
        } else if (this.player.getPlayerState() === 1 && !this.isIdle) {
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
            if(!snapshot.val() && !this.isIdle) {
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
      /**
       * onPlayerError()
       *
       * ERROR CODES:
       *
       * 2 – The request contains an invalid parameter value. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
       * 5 – The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.
       * 100 – The video requested was not found. This error occurs when a video has been removed (for any reason) or has been marked as private.
       * 101 – The owner of the requested video does not allow it to be played in embedded players.
       * 150 – This error is the same as 101. It's just a 101 error in disguise!
       *
       */
      onPlayerError(e) {
        log('[player] onPlayerError() e: ', e);

        if ((e.data === 101 || e.data === 150) && this.isIdle) {
          this.playIdleVideo();
        }

        log('[player] onPlayerError() this.player info: ', this.player.getVideoData());
      },
      /*  onPlayerStateChange()
       *    -1 – unstarted
       *    0 – ended
       *    1 – playing
       *    2 – paused
       *    3 – buffering
       *    5 – video cued
       *
       */
      onPlayerStateChange(e) {
        log('[player] onPlayerStateChange state: ', e.data);
        switch(e.data) {
          case 1: //playing
            if (!this.isIdle) this.trackTime();
            break;
          case 0: //ended
            this.playNext();
            clearInterval(this.videoTimer);
            break;
          default:
            clearInterval(this.videoTimer);
        }
      },
      playIdleVideo() {
        var options = {
          list: this.idlePlaylistId,
          listType: 'playlist',
          index: Math.floor(Math.random() * (this.idlePlaylistLength - 1))
        };

        log('[player] playFiller() options', options);

        this.player.loadPlaylist(options);

        this.isIdle = true;
      },
      /**
       * playNext() plays next video in queue
       */
      playNext() {
        if(!this.currentVideo || !this.videos.length) {
          if (this.isIdle) {
            this.playIdleVideo();
          }

          return;
        }

        log('playing next');

        this.db.ref().update({videoPosition: 0});

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
          videoId: 'QtxlCsVKkvY',
          playerVars: {
            autoplay: false,
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
            'onError': this.onPlayerError
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
  h1, h2, h3, h4, h5 {
    font-weight: 500;
    margin: 0.3em 0;
    position: relative;
  }

  .idle-player,
  .no-videos {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;

    h1, h4 {
      color: white;
      font-family: "HelveticaNeueBold", "HelveticaNeue-Bold", "Helvetica Neue Bold", "HelveticaNeue", "Helvetica Neue", 'TeXGyreHerosBold', "Helvetica";
      font-style: italic;
      font-weight: 600;
      margin: 0;
    }

    h1 {
      font-size: 6.6vw;
      line-height: 1.2em;
      text-transform: uppercase;
    }

    h4 {
      color: #ba68c8;
      font-size: 5.3vw;
      line-height: 1.25em;
    }
  }

  .idle-player {
    color: #fff;
  }

  .no-videos {
    background: black;
    color: #ec407a;
    z-index: 100;
  }

  .preview {
    align-items: center;
    background: black;
    color: #ba68c8;
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: center;
    left: 0;
    padding: 18% 3%;
    position: fixed;
    text-align: center;
    top: 0;
    width: 100vw;
    z-index: 100;

    h1 {
      font-size: 7vw;
    }

    h4 {
      color: white;
      font-size: 4.3vw;
      font-weight: 300;
    }

    &:after {
      z-index: -1;
    }
  }

  .video-view {
    height: 100vh;
    background: black;
    width: 100vw;
  }

  .no-videos,
  .preview {
    .bg {
      content: "";
      background-color: black;
      background-size: 100% auto;
      filter: grayscale(20%);
      opacity: 0.4;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      top: 0;
      width: 100%;
    }
  }
</style>
