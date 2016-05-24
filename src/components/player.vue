<template>
  <div class="video-view">
    <div class="video-container">
      <div id="mainPlayer"></div>
    </div>
  </div>
</template>

<script>
  import YoutubeIframeLoader from 'youtube-iframe';

  export default {
    props: [
      'firebaseRef'
    ],
    data() {
      return {
        currentVideo: {},
        queueRef: {},
        player: null,
        videos: [],
        videoURL: null
      }
    },
    ready() {
      this.setFirebaseValues();
      this.setFirebaseEvents();

      YoutubeIframeLoader.load(this.setPlayer);
    },
    methods: {
      /**
       * setFirebaseEvents sets collection events and binds to Vue methods
       */
      setFirebaseEvents() {
      },
      /**
       * Set Firebase references and any variables related to Firebase
       */
      setFirebaseValues() {
        // Set Firebase 'queue' reference
        this.queueRef = this.firebaseRef.database().ref('queue');
      },
      setPlayer(YT) {
        // Fetch videos from 'queue' if empty
        this.queueRef.once('value').then((snapshot) => {
          var videosData = snapshot.val();

          this.currentVideo = videosData[Object.keys(videosData)[0]];

          this.player = new YT.Player('mainPlayer', {
              videoId: this.currentVideo.song.id,
              playerVars: {
                controls: 0,
                modestbranding: true,
                rel: 0,
                showinfo: 0
              }
          });
        });
      }
    }
  }
</script>

<style>
  .video-view {
    height: 100vh;
    background: black;
    width: 100vw;
  }
</style>
