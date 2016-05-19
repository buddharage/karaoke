<template>
  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 2rem; right: 2rem;"
      v-link="'/search'">
      <i class="material-icons">search</i>
    </a>
  </div>

  <ul v-if="videos.length > 0" class="collection">
    <li v-for="video in videos" track-by="key" class="collection-item">
        {{ video.song.title }}
    </li>
  </ul>

  <div class="no-songs center" v-if="!videos.length">
    <p>No videos are in queue.<p>
    <a class="btn" v-link="'/search'">Let's do this!</a>
  </div>
</template>

<script>
  export default {
    props: [
      'firebaseRef'
    ],
    data() {
      return {
        queueRef: {},
        videos: []
      }
    },
    ready() {
      this.setFirebaseValues();
      this.setFirebaseEvents();

      // Check how many videos we have
      setTimeout(() => console.log('videos in queue', this.videos), 1200);
    },
    methods: {
      /**
       * checkKeyDupe() checks the array for a duplicate object
       * keys should be unique
       * @param  {String}   key   Firebase key
       */
      checkKeyDupe(key) {
          return this.videos.filter((video) => video.key === key).length === 0;
      },
      /**
       * setFirebaseEvents sets collection events and binds to Vue methods
       */
      setFirebaseEvents() {
        this.queueRef.on('child_added', this.videoAdd);
        this.queueRef.on('child_removed', this.videoRemove);
      },
      /**
       * Set Firebase references and any variables related to Firebase
       */
      setFirebaseValues() {
        // Set Firebase 'queue' reference
        this.queueRef = this.firebaseRef.database().ref('queue');

        // Fetch videos from 'queue' if empty
        if(this.videos.length === 0) {
          this.queueRef.once('value').then((snapshot) => {
            var videosData = snapshot.val();

            // Convert to array
            for(var videoKey in videosData) {
              if(videosData.hasOwnProperty(videoKey)
                && this.checkKeyDupe(videoKey)) {
                // Add to video queue
                this.videos.push(videosData[videoKey]);
              }
            }
          });
        }
      },
      videoAdd(data) {
        if(!data || !this.videos) {
          return;
        }

        var newVideo = data.val();

        // Make sure to add key into video object
        newVideo.key = data.key;

        // Add video to Vue data
        this.videos.push(newVideo);

      },
      videoRemove(data) {
        if(!data || !this.videos) {
          return false;
        }

        // Delete from Vue data
        this.videos.forEach((video, index) => {
            if(data.key === video.key) {
              this.videos.$remove(video);
            }
        });
      },
    }
  }
</script>
