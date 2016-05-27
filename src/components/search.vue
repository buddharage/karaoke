<template>
  <div class="fixed-action-btn">
    <a class="btn-floating btn-large waves-effect waves-light red btn-floating"
      style="bottom: 2rem; right: 2rem;"
      v-link="'/'">
      <i class="material-icons">list</i>
    </a>
  </div>

  <form v-on:submit.prevent="searchYT">
    <div class="input-field">
      <input type="text" placeholder="Search" v-model="query" id="video-search">
    </div>
  </form>

  <div class="search-results row">
    <div class="card small activator col s12 m6 l4"
      v-for="video in videosResult"
      v-on:click.prevent="confirmVideo(video)">
        <div class="card-image">
          <img v-bind:src="video.snippet.thumbnails.high.url">
        </div>
      <div class="card-content">
        <span class="card-title">{{ video.snippet.title }}</span>
      </div>
    </div>
  </div>

  <div v-if="isConfirmModalOpen" class="modal bottom-sheet center z-depth-3" transition="modal">
    <div v-if="videoToConfirm" class="modal-content">
      <p>Who's singing</p>

      <h5>{{ videoToConfirm.snippet.title }}?</h5>

      <div class="input-field">
        <i class="material-icons prefix">mic</i>
        <input v-model="performer" v-on:focus="performer = ''" type="text" placeholder="Performer's name"  id="input-performer">
        <label class="active" for="input-performer">Performer</label>
      </div>

      <button v-on:click.prevent="addToQueue(videoToConfirm)" class="btn">Ok</button>
    </div>
  </div>

  <div v-if="isConfirmModalOpen" v-on:click="isConfirmModalOpen = false" transition="fade" class="overlay"></div>
</template>

<script>
  import api from 'youtube-api-simple';
  import config from '../../config';
  import log from '../helpers/log';

  // Set Youtube API object
  var youtube = api({
    api: config.googleKey,
    uri: 'https://www.googleapis.com/youtube/v3/'
  });

  export default {
    data() {
      return {
        isConfirmModalOpen: false,
        videoToConfirm: null,
        query: '',
        performer: 'someone',
        videosResult: []
      }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    methods: {
      /**
       * addToQueue() adds video to Firebase database
       * in the 'queue' table
       * @param {Object}  video
       */
      addToQueue(video) {
        if(!video) {
          return;
        }

        this.db.ref('queue').push({
          performer: this.performer,
          song: {
            id: video.id.videoId,
            title: video.snippet.title
          }
        }).then(() => {
          this.isConfirmModalOpen = false;

          // Redirect to queue view
          this.$route.router.go({name: 'queue'})
        });
      },
      confirmVideo(video) {
        if(!video) {
          return;
        }

        this.isConfirmModalOpen = true;

        this.videoToConfirm = video;
      },
      /**
       * searchYT uses Google API to get a list of videos
       * @return {Object}   List of videos
       */
      searchYT() {
        youtube.search().list({
          part: 'snippet',
          // q: this.query + ' karaoke'
          q: this.query
        }).then((data) => {
          if(!data) {
            return;
          }

          // Parse search results
          // and show in Vue
          this.videosResult = JSON.parse(data).items;
        });
      }
    }
  }
</script>

<style lang="sass" scoped>
  .modal {
    .input-field {
      margin: 3.6rem 0;

      label {
        left: 0;
      }
    }
  }

  .fade-transition {
    transition: opacity 0.5s linear;
    display: block;
    opacity: 0.5;
  }

  .fade-enter,
  .fade-leave {
    opacity: 0;
  }

  .overlay {
    background: #000;
    height: 100vh;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 999;
  }

  /**
   * Custom VueJS transitions
   */
  .modal.bottom-sheet.modal-transition,
  .modal-transition {
    bottom: 0;
    display: block;
    transition: all 0.5s ease-out;
    z-index: 1000;
  }

  .modal.bottom-sheet.modal-leave,
  .modal.bottom-sheet.modal-enter,
  .modal-leave,
  .modal-enter {
    bottom: -100%;
  }

  /**
   * End Transitions
   */
</style>
