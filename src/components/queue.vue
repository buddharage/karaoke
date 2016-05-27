<template>
  <controls v-if="videos.length"
    :db="db"
    :videos="videos"
    :current-video="currentVideo"
    ></controls>

  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light green btn-floating"
      style="bottom: 1%; right: 1%;"
      v-link="'/search'">
      <i class="material-icons">search</i>
    </a>
  </div>

  <ul v-if="videos && videos.length" class="collection">
    <li v-for="video in videos" v-on:click="openVideoModal(video)" track-by="key" transition="append" class="collection-item">
        {{ video.performer }} - {{ video.song.title }}
    </li>
  </ul>

  <div v-else class="no-songs center">
    <p>No videos are in queue.<p>
    <a  v-link="'/search'"class="btn green">Let's do this!</a>
  </div>

  <div v-if="isVideoModalOpen" class="modal bottom-sheet center" transition="modal">
    <div v-if="openedVideo" class="modal-content">
      <h5>{{ openedVideo.song.title }}</h5>

      <div class="options">
        <button v-on:click.prevent="removeVideo" class="btn red">Remove Video</button>
        <button v-on:click.prevent="moveVideoToNext" class="btn blue">Play Next</button>
      </div>
    </div>
  </div>

  <div v-if="isVideoModalOpen" v-on:click="isVideoModalOpen = false" transition="fade" class="overlay"></div>
</template>

<script>
  import controls from './controls.vue';
  import log from '../helpers/log';

  export default {
    components: {
      'controls': controls
    },
    data() {
      return {
        isVideoModalOpen: false,
        openedVideo: {}
      }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    ready() {
      // Check how many videos we have
      setTimeout(() => log('%c videos in queue', 'color: coral', this.videos), 800);
    },
    methods: {
      /**
       * Find the index for an object with given key.
       *
       * @param {array} array
       * @param {string} key
       * @return {number}
       */
      indexForKey(array, key) {
        for(var i = 0; i < array.length; i++) {
          if (array[i]['key'] === key) {
            return i;
          }
        }
        /* istanbul ignore next */
        return -1;
      },
      /**
       * moveVideoToNext() moves the video to the front of the queue
       */
      moveVideoToNext() {
        var openedVideoKey = this.indexForKey(this.videos, this.openedVideo.key);
        var newQueue = {};

        if(!openedVideoKey) {
          return;
        }

        /**
         *  Re-order on the local array
         */

        // Delete from queue
        this.videos.splice(openedVideoKey, 1);

        // Add it to next in queue
        this.videos.splice(1, 0, this.openedVideo);

        /**
         * Convert to a Firebase array that is indexed by the key
         */
        this.videos.forEach((video, index) => {
          newQueue[video.key] = video;
        });

        // Replace the queue with the new ordered queue
        this.db.ref().update({'queue': newQueue});

        // Broadcast message
        this.db.ref().update({
          'message': this.openedVideo.song.title + ' moved up!'
        });

        // Close modal
        this.isVideoModalOpen = false;
        this.openedVideo = null;
      },
      /**
       * openVideoModal() opens video-specific modal
       * @param  {Object} video
       */
      openVideoModal(video) {
        if(!video) {
          return;
        }

        // Open modal
        this.isVideoModalOpen = true;

        // Set the current opened video
        this.openedVideo = video;
      },
      /**
       * removeVideo() removes a video from the queue
       */
      removeVideo() {
        if(!this.openedVideo) {
          return;
        }

        var key = this.openedVideo.key;

        this.isVideoModalOpen = false;

        this.db.ref().update({'message': this.openedVideo.song.title + ' has been removed!'});

        // remove first item in array
        this.db.ref('queue/' + key).remove(() => {
          log('%c removed', 'color: red', key)

          this.openedVideo = null;
        });
      }
    }
  }
</script>

<style lang="sass" scoped>
  .collection-item {
    cursor: pointer;
  }

  .modal {
    .options {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin: 3.6rem 0;

      button {
        margin-bottom: 1.6em;
        max-width: 25rem;
        width: 100%;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
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
