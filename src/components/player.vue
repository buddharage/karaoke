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
    data() {
      return {
        currentVideo: {},
        db: this.firebaseRef.database(),
        queueRef: this.firebaseRef.database().ref('queue'),
        player: null,
        videoTimer: null,
        videos: [],
        videoURL: null
      }
    },
    mixins: [
      firebaseMixin
    ],
    props: [
      'firebaseRef'
    ],
    ready() {
      YoutubeIframeLoader.load(this.setPlayer);
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
       * onQueueChange() listens to changes to the Firebase queue
       * @param  {Object} snapshot  Firebase object
       */
      onQueueChange(snapshot) {
        // var videosData = snapshot.val();
        //
        // this.currentVideo = videosData ? videosData[Object.keys(videosData)[0]]: null;
        //
        // if(this.currentVideo) {
        //   this.firebaseRef.database().ref().update({currentTrack: this.currentVideo});
        //
        //   log('currentVideo', this.currentVideo);
        //   this.player.cueVideoById(this.currentVideo.song.id);
        // }
      },
      /**
       * onTrackChange() loads a new video
       * @param  {Object} snapshot  Firebase data
       */
      onTrackChange(snapshot) {
        var resVideo = snapshot.val();

        // Make sure video doesn't load twice
        if(this.currentVideo && resVideo.song.id !== this.currentVideo.song.id) {
          this.player.loadVideoById(snapshot.val().song.id);
        }
      },
      /**
       * onPlayerReady() initializes after Youtube player loads
       */
      onPlayerReady() {
        // Bind Firebase events to player
        this.db.ref('isPlaying').on('value', this.onPlaybackChange);

        this.db.ref('currentTrack').on('value', this.onTrackChange);

        this.db.ref('queue').on('value', this.onQueueChange);
      },
      onPlayerStateChange(e) {
        log('state changing', e.data);

        if(e.data === 1) { // Started playing
          this.trackTime();
        } else {
          clearInterval(this.videoTimer);
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

        // Fetch videos from 'queue' if empty
        this.queueRef.once('value').then((snapshot) => {
          var videosData = snapshot.val();

          // Set current video if there is a queue
          this.currentVideo = videosData ? videosData[Object.keys(videosData)[0]]: null;

          // If there is a current video, update Firebase
          this.db.ref().update({currentTrack: this.currentVideo});

          if(this.currentVideo) {
            // Set the Youtube player to play currentVideo
            youtubeOpts.videoId = this.currentVideo.song.id;
          }

          this.db.ref('videoPosition').once('value').then((snapshot) => {
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
