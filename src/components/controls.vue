<template>
  <div class="controls center">
    <button class="btn-floating btn-large waves-effect waves-light">
      <i class="material-icons">replay</i>
    </button>

    <button class="btn-floating btn-large waves-effect waves-light">
      <i class="material-icons">play_arrow</i>
    </button>

    <button class="btn-floating btn-large waves-effect waves-light">
      <i class="material-icons">skip_next</i>
    </button>
  </div>
</template>

<script>
  import firebaseMixin from '../mixins/firebase';
  import log from '../helpers/log';

  export default {
    props: [
      'firebaseRef'
    ],
    mixins: [firebaseMixin],
    data() {
      return {
      }
    },
    ready() {
    }
  }
</script>
