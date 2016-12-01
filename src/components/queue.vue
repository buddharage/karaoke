<template>
  <div class="queue-view">
    <controls
      :db="db"
      :videos="videos"
      :current-video="currentVideo"
      ></controls>

    <div v-if="videos && videos.length" class="fixed-action-btn">
      <router-link to="/search" class="btn-floating btn-large waves-effect waves-light purple darken-1 btn-floating"
        style="bottom: 1%; right: 1%;">
        <i class="material-icons">playlist_add</i>
      </router-link>
    </div>

    <ul v-if="videos && videos.length" class="collection">
      <transition-group name="append">
        <li v-for="(video, index) in videos" v-on:click="openVideoModal(video)" :key="video.key" class="collection-item">
             <span class="song-name">{{ video.song.title }}</span>
             <span class="performer-name">{{ video.performer }}</span>
             <i v-if="index === 0 && isPlaying" class="equalizer"></i>
        </li>
      </transition-group>
    </ul>

    <div v-else class="no-songs center">
      <div class="no-songs-content">
        <p>Put some songs in!<p>
        <router-link to="/search"class="btn-floating btn-large purple darken-1 z-depth-4"><i class="material-icons">playlist_add</i></router-link>
      </div>
    </div>

    <transition name="modal">
      <div v-if="isVideoModalOpen" class="modal bottom-sheet override center">
        <div v-if="openedVideo" class="modal-content">
          <h5>{{ openedVideo.song.title }}</h5>

          <div class="options">
            <button v-on:click.prevent="removeVideo" class="btn red darken-1">
              <i class="material-icons">delete</i>
              Remove Video
            </button>
            <button v-on:click.prevent="moveVideoToNext" class="btn blue darken-1">
              <i class="material-icons">present_to_all</i>
              Play Next
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="isVideoModalOpen" v-on:click="isVideoModalOpen = false"  class="overlay"></div>
    </transition>
  </div>
</template>

<script>
  import controls from './controls.vue';
  import log from '../helpers/log';

  export default {
    name: 'queue',
    components: {
      'controls': controls
    },
    data() {
      return {
        isPlaying: false,
        isVideoModalOpen: false,
        openedVideo: {}
      }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    mounted() {
      // Bind Firebase events to player
      this.db.ref('isPlaying').on('value', (snapshot) => {
          this.isPlaying = snapshot.val();
      });

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
        var _tempArr = this.videos.map((val) => val);
        var openedVideoKey = this.indexForKey(this.videos, this.openedVideo.key);

        if(!openedVideoKey) {
          return;
        }

        // Set a Firebase transfer to accomodate potential concurrent requests
        this.db.ref('queue').transaction((queue) => {
          /**
           *  Re-order on temporary array
           */
          // Delete from queue
          _tempArr.splice(openedVideoKey, 1);


          // Add it to next in queue
          _tempArr.splice(1, 0, this.openedVideo);

          /**
           * Change priorities for each video
           */
          _tempArr.forEach((video, index) => {
            log('changing priority for ', video.song.title);
            log('with priority ', index + 1);
            this.db.ref('queue/' + video.key).setPriority(index + 1);
          });


          // Broadcast message
          this.db.ref().update({
            'message': this.openedVideo.song.title + ' moved up!'
          });

          // Close modal
          this.isVideoModalOpen = false;
          this.openedVideo = null;
        });
      },
      /**
       * openVideoModal() opens video-specific modal
       * @param  {Object} video
       */
      openVideoModal(video) {
        if(!video || video === this.currentVideo) {
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
  .collection {
    border: none;

    .collection-item {
      cursor: pointer;
      line-height: 1.3em;
      perspective: 100px;
      transform: none;
      transition: transform 0.5s cubic-bezier(.36,-0.64,.34,1.76);

      .song-name {
        display: block;
        font-weight: 700;
        margin-bottom: 0.3em;
      }

      .performer-name {
        text-transform: capitalize;
      }

      &:first-child {
        background: #f06292;
        color: white;
        cursor: default;
        margin-bottom: 0;
        margin-left: 0;
        margin-right: 0;
        padding-bottom: 20px;
        padding-right: 62px;
        padding-top: 20px;
        font-size: 28px;
        font-weight: 200;
      }
    }
  }

  .modal {
    .options {
      align-items: center;
      display: flex;
      flex-direction: column;
      margin: 3.6rem 0;

      button {
        display: flex;
        jusitfy-content: center;
        margin-bottom: 1.5em;
        max-width: 25rem;
        width: 100%;

        i {
          font-size: 1.5em;
          margin-right: 0.6em;
        }

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }

  .no-songs {
    align-items: center;
    display: flex;
    height: 100vh;
    justify-content: center;

    .no-songs-content {
      width: 100%;
    }

    p {
      font-size: 64px;
      font-weight: 200;
      margin: 0;

      &:first-child {
        line-height: 1.1em;
        margin-bottom: 0.6em;
      }
    }

    .btn-large {
      height: 250px;
      width: 250px;

      i {
        font-size: 120px;
        line-height: 250px;
      }
    }
  }

  /** Custom VueJS animations **/
  .append-enter,
  .append-leave-active {
    opacity: 0;
    transform: rotateX(-90deg);
  }

  /**
    * Equalizer
    */
  $size: 90px;

  // When $size is 40px, $max is 14px, $width is 4px, $margin is 1px

  $max: $size / 2.857142857;
  $width: $max / 3.5;
  $margin: $max / 14;
  $color: black;

  $equalizers: 3;
  $equalizerSize: ($equalizers * $width) + ( ($equalizers - 1) * $margin );
  $bottom: 15px;
  $right: 42px;
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
