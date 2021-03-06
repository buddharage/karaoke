<template>
  <div class="main">
    <transition name="page">
      <router-view
        :current-video="currentVideo"
        :db="db"
        :isAdmin="isAdmin"
        :videos="videos"></router-view>
    </transition>

    <transition name="popout">
      <div v-if="message" v-on:click.prevent="message = null" class="btn message">
        <span>{{ message }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
  import config from '../config';
  import Firebase from 'firebase/app';
  import firebaseMixin from './mixins/firebase';
  import 'firebase/database';
  import log from './helpers/log.js';
  import router from './routes';

  var firebaseRef = Firebase.initializeApp(config.firebase);

  export default {
    name: 'app',
    router,
    mixins: [firebaseMixin],
    computed: {
      currentVideo() {
        if(this.videos.length) {
          log('%c Currently playing: %c %s', 'color: aquamarine', 'color: coral', this.videos[0].song.title);
        }
        return this.videos[0];
      }
    },
    data() {
      return {
        db: firebaseRef.database(),
        dismissMessageTimeout: null,
        isAdmin: this.$route.query.admin,
        message: '',
        showMessage: false,
        videos: {
          asObject: false,
          source: firebaseRef.database().ref('queue').orderByPriority()
        }
      }
    },
    mounted() {
      this.bindFirebaseEvents();
      log('app mounted() this.videos: ', this.videos);
    },
    methods: {
      /**
       * bindFirebaseEvents() adds event listeners for Firebase
       */
      bindFirebaseEvents() {
        // Listen for messages
        this.db.ref('message').on('value', this.onMessage);
      },
      /**
       * onMessage() shows a message if one is set by a Vue event
       * @param  {String} message
       */
      onMessage(snapshot) {
        if(!snapshot) {
          return;
        }

        var message = snapshot.val();

        clearTimeout(this.dismissMessageTimeout);

        if(!message) {
          this.message = '';

          return;
        }

        // Set message
        this.message = message;

        // Dismiss message
        this.dismissMessageTimeout = setTimeout(() =>
          // Empty message
          this.db.ref().update({'message': ''})
        , 8000);
      }
    }
  }
</script>

<style lang="sass">
  [v-cloak] {
    display: none;
  }

  .main {
    height: 100%;
    position: relative;
    width: 100%;
  }

  .queue-view,
  .search-view {
    background: white;
    left: 0;
    min-height: 100vh;
    opacity: 1;
    position: absolute;
    top: 0;
    width: 100vw;
  }

  .message {
    bottom: 2%;
    left: 5%;
    font-size: 5vw;
    z-index: 1000;
    width: auto;
    opacity: 1;
    position: fixed;
    max-width: 90%;
    width: 100%;

    &.btn {
      background-color: rgba(0,0,0,0.6);
      border-radius: 0;
      font-family: 'Roboto', 'Helvetica Neue', Helvetica;
      font-weight: 500;
      height: auto;
      line-height: 1.3;
      padding: 1em;
      text-transform: none;

      &:hover {
        background-color: rgba(0,0,0,0.3);
      }
    }

    span {
      width: 100%;
    }
  }

  .modal {
    h1, h2, h3, h4, h5 {
      line-height: 1.6em;
    }
  }

  .overlay {
    background: white;
    display: block;
    height: 100%;
    left: 0;
    opacity: 0.6;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 999;
  }

  @media only screen and (min-width: 600px) {
    .message {
      bottom: 5%;
      font-size: 1.8vw;
      left: 20%;
      max-width: 60%;

      &.btn {
        border-radius: 22.5rem;
      }
    }
  }

  /**
   * Custom VueJS Animations
   */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s linear;
  }

  .fade-enter,
  .fade-leave-active {
    opacity: 0;
  }

  .modal.bottom-sheet.override {
    bottom: 0;
    display: block;
    max-height: 100%;
    z-index: 1000;
  }

  .modal.bottom-sheet.modal-enter-active,
  .modal-enter-active {
    transition: all 0.5s ease-out;
  }

  .modal.bottom-sheet.modal-enter,
  .modal.bottom-sheet.modal-leave-active,
  .modal-leave,
  .modal-enter {
    bottom: -100%;
  }

  .page-enter-active {
    position: fixed;
    transition: all 0.3s ease;
  }

  .page-enter {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
    z-index: 99999;
  }

  .popout-leave-active {
    transition: all 600ms ease-out;
  }

  .popout-enter-active {
    transition: all 600ms ease-in;
  }

  .popout-enter,
  .popout-leave-active {
    opacity: 0;
    transform: scale(0.9);
  }

  .zoom-leave-active {
    transition: all 300ms ease-in;
  }

  .zoom-enter-active {
    transition: all 300ms;
  }

  .zoom-enter,
  .zoom-leave-active {
    transform: scale(1.1);
  }
  /**
   * End Animations
   */
</style>
