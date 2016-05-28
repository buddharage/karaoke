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
    <li v-for="(index, video) in videos" v-on:click="openVideoModal(video)" track-by="key" transition="append" class="collection-item">
        {{ video.performer }} - {{ video.song.title }} <i v-if="index === 0" class="equalizer"></i>
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

  /**
   * Equalizer
   */
  $size: 60px;

  // When $size is 40px, $max is 14px, $width is 4px, $margin is 1px

  $max: $size / 2.857142857;
  $width: $max / 3.5;
  $margin: $max / 14;
  $color: black;

  $equalizers: 3;
  $equalizerSize: ($equalizers * $width) + ( ($equalizers - 1) * $margin );
  $bottom: 10px;
  $right: 32px;
  // $bottom: ( $size - $max ) / 2;
  // $left: ( $size - $equalizerSize ) / 2;

  // Heights
  $two: $max / 7;
  $three: $max / 4.666666667;
  $four: $max / 3.5;
  $five: $max / 2.8;
  $six: $max / 2.333333333;
  $seven: $max / 2;
  $eight: $max / 1.75;
  $nine: $max / 1.555555556;
  $ten: $max / 1.4;
  $eleven: $max / 1.272727273;
  $twelve: $max / 1.166666667;
  $thirteen: $max / 1.076923077;
  $fourteen: $max;

  .equalizer {
    position: absolute;
    bottom: $bottom;
    right: $right;
    display: block;
    width: $width;
    background-color: $color;
    height: $two;
  }

  .equalizer,
  .equalizer::before,
  .equalizer::after {
    animation: equalize 1.25s steps(25, end) 0s infinite;
  }

  .equalizer::before,
  .equalizer::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: $width + $margin;
    height: $max;
    width: $width;
    background-color: $color;
  }

  // Equalizer 2
  .equalizer::before {
    animation-name: equalize2;
  }

  // Equalizer 3
  .equalizer::after {
    left: $width * 2 + $margin * 2;
    animation-name: equalize3;
  }

  @keyframes equalize {
    0% {
      height: $four;
    }
    4% {
      height: $two;
    }
    8% {
      height: $four;
    }
    12% {
      height: $seven;
    }
    16% {
      height: $ten;
    }
    20% {
      height: $thirteen;
    }
    24% {
      height: $twelve;
    }
    28% {
      height: $eleven;
    }
    32% {
      height: $eleven;
    }
    36% {
      height: $eight;
    }
    40% {
      height: $ten;
    }
    44% {
      height: $ten;
    }
    48% {
      height: $eleven;
    }
    52% {
      height: $twelve;
    }
    56% {
      height: $thirteen;
    }
    60% {
      height: $twelve;
    }
    64% {
      height: $twelve;
    }
    68% {
      height: $eleven;
    }
    72% {
      height: $ten;
    }
    76% {
      height: $eleven;
    }
    80% {
      height: $twelve;
    }
    84% {
      height: $twelve;
    }
    88% {
      height: $thirteen;
    }
    92% {
      height: $ten;
    }
    96% {
      height: $seven;
    }
    100% {
      height: $four;
    }
  }


  @keyframes equalize2 {
    0% {
      height: $twelve;
    }
    4% {
      height: $thirteen;
    }
    8% {
      height: $twelve;
    }
    12% {
      height: $twelve;
    }
    16% {
      height: $eleven;
    }
    20% {
      height: $eleven;
    }
    24% {
      height: $eleven;
    }
    28% {
      height: $twelve;
    }
    32% {
      height: $twelve;
    }
    36% {
      height: $thirteen;
    }
    40% {
      height: $thirteen;
    }
    44% {
      height: $thirteen;
    }
    48% {
      height: $eleven;
    }
    52% {
      height: $eight;
    }
    56% {
      height: $six;
    }
    60% {
      height: $eight;
    }
    64% {
      height: $ten;
    }
    68% {
      height: $eleven;
    }
    72% {
      height: $thirteen;
    }
    76% {
      height: $twelve;
    }
    80% {
      height: $twelve;
    }
    84% {
      height: $eleven;
    }
    88% {
      height: $eleven;
    }
    92% {
      height: $nine;
    }
    96% {
      height: $eleven;
    }
    100% {
      height: $twelve;
    }
  }


  @keyframes equalize3 {
    0% {
      height: $nine;
    }
    4% {
      height: $seven;
    }
    8% {
      height: $nine;
    }
    12% {
      height: $eleven;
    }
    16% {
      height: $thirteen;
    }
    20% {
      height: $size / 2.666666667;
    }
    24% {
      height: $fourteen;
    }
    28% {
      height: $eleven;
    }
    32% {
      height: $nine;
    }
    36% {
      height: $eight;
    }
    40% {
      height: $seven;
    }
    44% {
      height: $five;
    }
    48% {
      height: $eight;
    }
    52% {
      height: $ten;
    }
    56% {
      height: $eleven;
    }
    60% {
      height: $thirteen;
    }
    64% {
      height: $twelve;
    }
    68% {
      height: $eleven;
    }
    72% {
      height: $eleven;
    }
    76% {
      height: $ten;
    }
    80% {
      height: $twelve;
    }
    84% {
      height: $thirteen;
    }
    88% {
      height: $fourteen;
    }
    92% {
      height: $twelve;
    }
    96% {
      height: $ten;
    }
    100% {
      height: $nine;
    }
  }
</style>
