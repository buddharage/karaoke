import log from '../helpers/log';

var Vue // late binding

/**
 * Check if a value is an object.
 *
 * @param {*} val
 * @return {boolean}
 */
function isObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

/**
 * Convert firebase snapshot into a bindable data record.
 *
 * @param {FirebaseSnapshot} snapshot
 * @return {Object}
 */
function createRecord(snapshot) {
  var value = snapshot.val();
  var res = isObject(value)
    ? value
    : { '.value': value };
  res['key'] = snapshot.key;
  return res;
}

/**
 * Find the index for an object with given key.
 *
 * @param {array} array
 * @param {string} key
 * @return {number}
 */
function indexForKey(array, key) {
  for(var i = 0; i < array.length; i++) {
    if (array[i]['key'] === key) {
      return i;
    }
  }
  /* istanbul ignore next */
  return -1;
}

/**
 * Bind a firebase data source to a key on a vm.
 *
 * @param {Vue} vm
 * @param {string} key
 * @param {object} source
 */
function bind(vm, key, source) {
  var asObject = source.asObject || false;
  var cancelCallback = source.cancelCallback || null;

  source = source.source;

  if (!isObject(source)) {
    throw new Error('Firebase mixin: invalid Firebase binding source. Make sure it\'s an object');
  }

  // get the original ref for possible queries
  var ref = source;

  if (typeof source.ref === 'function') {
    ref = source.ref();
  }

  vm.$firebaseRefs[key] = ref;
  vm._firebaseSources[key] = source;
  // bind based on initial value type

  if(asObject) {
    bindAsObject(vm, key, source, cancelCallback);
  } else {
    bindAsArray(vm, key, source, cancelCallback);
  }
}

/**
 * Bind a firebase data source to a key on a vm as an Array.
 *
 * @param {Vue} vm
 * @param {string} key
 * @param {object} source
 * @param {function|null} cancelCallback
 */
function bindAsArray (vm, key, source, cancelCallback) {
  var array = [];
  vm[key] = array;

  var onAdd = source.on('child_added', (snapshot) => {
    log('%c CHILD ADDED EVENT', 'color: red');
    array.push(createRecord(snapshot));
  }, cancelCallback);

  var onRemove = source.on('child_removed', (snapshot) => {
    log('%c CHILD REMOVED EVENT', 'color: red');
    var index = indexForKey(array, snapshot.key);
    array.splice(index, 1);
  }, cancelCallback)

  var onChange = source.on('child_changed', (snapshot) => {
    log('%c CHILD CHANGED EVENT', 'color: red');
    var index = indexForKey(array, snapshot.key);
    array.splice(index, 1, createRecord(snapshot));
  }, cancelCallback);

  var onMove = source.on('child_moved', (snapshot, prevKey) => {
    log('%c CHILD MOVED EVENT', 'color: red');

    log('%c getting snapshot key', 'color: hotpink', snapshot.key);
    log('%c getting snapshot priority', 'color: hotpink', snapshot.getPriority());
    log('%c indexForKey() %c array: ', 'color: coral', 'color: white', array);
    log('%c indexForKey() %c key: ', 'color: coral', 'color: white', snapshot.key);
    var index = indexForKey(array, snapshot.key);
    var record = array.splice(index, 1)[0];

    log('%c getting previous key', 'color: hotpink', prevKey);
    log('%c indexForKey() %c array: ', 'color: coral', 'color: white', array);
    log('%c indexForKey() %c key: ', 'color: coral', 'color: white', prevKey);
    var newIndex = prevKey ? indexForKey(array, prevKey) + 1 : 0;

    log('%c indexForKey value for previous key', 'color: coral', indexForKey(array, prevKey));
    log('%c new index value', 'color: coral', newIndex);

    array.splice(newIndex, 0, record);
  }, cancelCallback);

  vm._firebaseListeners[key] = {
    child_added: onAdd,
    child_removed: onRemove,
    child_changed: onChange,
    child_moved: onMove
  };
}

/**
 * Bind a firebase data source to a key on a vm as an Object.
 *
 * @param {Vue} vm
 * @param {string} key
 * @param {Object} source
 * @param {function|null} cancelCallback
 */
function bindAsObject (vm, key, source, cancelCallback) {
  vm.$set(key, {});
  var cb = source.on('value', (snapshot) => {
    vm[key] = createRecord(snapshot);
  }, cancelCallback);
  vm._firebaseListeners[key] = { value: cb };
}

/**
 * Unbind a firebase-bound key from a vm.
 *
 * @param {Vue} vm
 * @param {string} key
 */
function unbind(vm, key) {
  var source = vm._firebaseSources && vm._firebaseSources[key];
  if (!source) {
    throw new Error(
      'VueFire: unbind failed: "' + key + '" is not bound to ' +
      'a Firebase reference.'
    );
  }
  var listeners = vm._firebaseListeners[key];
  for (var event in listeners) {
    source.off(event, listeners[event]);
  }
  vm[key] = null;
  vm.$firebaseRefs[key] = null;
  vm._firebaseSources[key] = null;
  vm._firebaseListeners[key] = null;
}

/**
 * Ensure the related bookkeeping variables on an instance.
 *
 * @param {Vue} vm
 */
function ensureRefs(vm) {
  if (!vm.$firebaseRefs) {
    vm.$firebaseRefs = Object.create(null);
    vm._firebaseSources = Object.create(null);
    vm._firebaseListeners = Object.create(null);
  }
}

var mixin = {
  mounted() {
    var bindings = this.$data;

    if (!bindings) {
      return;
    }

    // make sure there are reference objects
    ensureRefs(this)

    for (var key in bindings) {
      let binding = bindings[key];

      // check { source, asArray, cancelCallback } syntax
      if(isObject(binding) && binding.hasOwnProperty('source')) {
        bind(this, key, binding);
      }
    }
  },
  beforeDestroy() {
    if (!this.$firebaseRefs) {
      return;
    }

    for (var key in this.$firebaseRefs) {
      if (this.$firebaseRefs[key]) {
        unbind(this, key);
      }
    }

    this.$firebaseRefs = null;
    this._firebaseSources = null;
    this._firebaseListeners = null;
  }
}

export default mixin;
