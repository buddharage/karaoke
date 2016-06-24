<template>
  <div class="main">
    <router-view
      :current-video="currentVideo"
      :db="db"
      keep-alive
      transition="page"
      transition-mode="out-in"
      :videos="videos"></router-view>

      <div v-if="message" transition="toast" v-on:click.prevent="message = null" class="btn message pink ligthen-1">
        <span>{{ message }}</span>
      </div>
  </div>
</template>

<script>
  import config from '../config';
  import Firebase from 'firebase/app';
  import firebaseMixin from './mixins/firebase';
  import 'firebase/database';
  import log from './helpers/log.js';

  var firebaseRef = Firebase.initializeApp(config.firebase);

  export default {
    mixins: [firebaseMixin],
    replace: false,
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
        message: '',
        showMessage: false,
        videos: {
          asObject: false,
          source: firebaseRef.database().ref('queue').orderByPriority()
        }
      }
    },
    ready() {
      this.bindFirebaseEvents();
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

  .message {
    max-width: 80%;
    z-index: 1000;
    width: auto;

    &.btn {
      height: auto;
      line-height: 1.3em;
      padding: 1em;
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
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100vw;
    z-index: 999;
  }

  /**
   * Custom VueJS Animations
   */
  .fade-transition {
    transition: opacity 0.5s linear;
    display: block;
    opacity: 0.6;
  }

  .fade-enter,
  .fade-leave {
    opacity: 0;
  }

  .modal.bottom-sheet.modal-transition,
  .modal-transition {
    bottom: 0;
    display: block;
    max-height: 100%;
    transition: all 0.5s ease-out;
    z-index: 1000;
  }

  .modal.bottom-sheet.modal-leave,
  .modal.bottom-sheet.modal-enter,
  .modal-leave,
  .modal-enter {
    bottom: -100%;
  }

  .page-transition {
    background: white;
    left: 0;
    min-height: 100vh;
    opacity: 1;
    position: absolute;
    top: 0;
    transition: all 0.3s ease;
    width: 100vw;
  }

  .page-enter {
    opacity: 0;
    transform: translate3d(100%, 0, 0);
  }

  .page-leave {
    opacity: 0;
  }

  .toast-transition {
    bottom: 1rem;
    left: 50%;
    opacity: 1;
    position: fixed;
    transform: translateX(-50%);
    transition: all 2s ease-out;
  }

  .toast-enter,
  .toast-leave {
    bottom: -100%;
    opacity: 0;
  }
  /**
   * End Animations
   */
</style>
