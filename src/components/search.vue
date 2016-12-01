<template>
  <div class="search-view">
    <div class="container">
      <div class="fixed-action-btn">
        <router-link to="/" class="btn-floating btn-large waves-effect waves-light red btn-floating"
          style="bottom: 1%; right: 1%;">
          <i class="material-icons">clear</i>
        </router-link>
      </div>

      <form v-on:submit.prevent="searchYT" class="search-form">
        <div class="input-field">
          <input v-model="query" ref="search-input" type="text" placeholder="Search">
        </div>

        <button class="search-submit-btn btn-floating btn-small waves-effect waves-light"><i class="material-icons">search</i></button>
      </form>

      <div class="search-results row">
        <div v-for="video in videosResult" class="col s12 m6 l4">
          <div v-on:click.prevent="confirmVideo(video)"class="card tiny">
            <div class="card-image">
              <img v-bind:src="video.snippet.thumbnails.high.url">
            </div>

            <div class="card-content">
              <span class="card-title">{{ video.snippet.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="isConfirmModalOpen" v-on:click="isConfirmModalOpen = false" class="overlay"></div>
      </transition>

      <loader :is-loading="isLoading"></loader>
    </div>

    <transition name="modal">
      <div v-if="isConfirmModalOpen" class="modal bottom-sheet override center">
        <div v-if="videoToConfirm" class="modal-content">
          <p>Who's singing</p>

          <h5>{{ videoToConfirm.snippet.title }}?</h5>

          <form v-on:submit.prevent="addToQueue(videoToConfirm)">
            <div class="input-field">
              <input v-model="performer" v-on:focus="performer = ''" type="text" placeholder="Performer's name" id="input-performer" lazy>
              <label class="active" for="input-performer">Performer</label>
            </div>

            <button class="btn">Ok</button>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import api from 'youtube-api-simple';
  import config from '../../config';
  import loader from './loader.vue';
  import log from '../helpers/log';

  // Set Youtube API object
  var youtube = api({
    api: config.googleKey,
    uri: 'https://www.googleapis.com/youtube/v3/'
  });

  export default {
    name: 'search',
    components: {
      'loader': loader
    },
    data() {
      return {
        isConfirmModalOpen: false,
        isLoading: false,
        videoToConfirm: null,
        query: '',
        performer: 'someone',
        videosResult: [],
        blockedChannels: [
            'Studio Group',
            'PopUp Karaoke Instrumentals',
            'The Late Late Show with James Corden',
            'KaraokeDiamonds',
            'KaraokeOnVEVO',
            'KARAOKEChannelIntl',
            'Sing2Piano | Piano Backing Tracks',
            'PianoNest'
        ]
      }
    },
    computed: {
        blockedChannelsString() {
          return this.blockedChannels.map(val => `-"${val}"`).join(' ');
        }
    },
    props: [
      'currentVideo',
      'db',
      'videos'
    ],
    mounted() {
      // Focus on search input
      this.$refs['search-input'].focus();
    },
    route: {
      // Executes after transition
      activate(transition) {
        // Reset search
        this.query = '';
        this.videosResult = [];

        this.isConfirmModalOpen = false;

        // Continue
        transition.next();
      }
    },
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

        log('adding this video: ', video);

        // Generate Firebase item key
        var key = this.db.ref('queue').push().key;

        // Set the key with a value and a priority
        this.db.ref('queue/' + key).setWithPriority({
          performer: this.performer,
          song: {
            id: video.id.videoId,
            title: video.snippet.title
          }
        }, this.videos.length + 1).then(() => {
          // Redirect to queue view
          log('search addToQueue() $router: ', this.$router);
          log('search addToQueue() this obj: ', this);
          this.$router.push({name: 'queue'})

          // Show a messsage to confirm to user that video
          // has been added
          this.db.ref().update({'message': video.snippet.title + ' added!'});
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
        // Modify query if not on production, i.e. show non-karaoke videos
        var query = process.env.NODE_ENV !== 'production' || this.$route.query.all ? this.query : this.query + ' karaoke ' + this.blockedChannelsString;

        log('search searchYT() query', query);

        this.isLoading = true;

        youtube.search().list({
          maxResults: 10,
          part: 'snippet',
          q: query,
          type: 'video',
          videoEmbeddable: true
        }).then((data) => {
          if(!data) {
            return;
          }

          this.isLoading = false;

          this.$refs['search-input'].blur();

          // Parse search results
          // and show in Vue
          this.videosResult = JSON.parse(data).items;

          log('search searchYT() results: ', this.videosResult);
        });
      }
    }
  }
</script>

<style lang="sass" scoped>
  .search-results.row {
    margin-bottom: 0;
  }

  .search-form {
    position: relative;

    .input-field {
      padding-right: 48px;
    }

    .search-submit-btn {
      right: 0;
      position: absolute;
      top: 0;
    }
  }

  .modal {
    .input-field {
      margin: 3.6rem 0;

      label {
        left: 0;
      }
    }
  }

  .card .card-content .card-title {
    display: block;
    line-height: 1.3em;
    font-size: 1.1rem;
    font-weight: 700;
    overflow: hidden;
    width: 100%;
  }

  @media only screen and (min-width: 600px) {
    .card .card-content .card-title {
      font-size: 0.8rem;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
