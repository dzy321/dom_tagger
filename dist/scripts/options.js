'use strict';

(function () {
  var storeKey = 'dt_params';

  window.comm = {
    getConfig: function getConfig() {
      var config = localStorage.getItem(storeKey);
      return config ? JSON.parse(config) : {};
    },
    trim: function trim(s) {
      return s.replace(/(^\s*)|(\s*$)/g, '');
    },
    setConfig: function setConfig(config) {
      localStorage.setItem(storeKey, JSON.stringify(config));
    }
  };
})();'use strict';

(function () {
  var config = comm.getConfig();

  // init
  var ids = Array.prototype.slice.call(document.getElementsByTagName('input')).map(function (ipt) {
    return ipt.id;
  });

  ids.forEach(function (id) {
    document.getElementById(id).value = config[id] || '';
  });

  // handle event
  document.getElementById('btnOk').addEventListener('click', function () {
    ids.forEach(function (id) {
      config[id] = comm.trim(document.getElementById(id).value);
    });
    comm.setConfig(config);
  }, false);
})();