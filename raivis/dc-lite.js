/* Mini-runtime: renders {{holes}}, <sc-for> lists and click handlers for KAVIS demo pages */
(function () {
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
  function get(ctx, path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, ctx); }
  function esc(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var handlers = [];
  function fill(tpl, ctx) {
    tpl = tpl.replace(/<sc-for\s+list="\{\{\s*([\w.]+)\s*\}\}"\s+as="(\w+)"[^>]*>([\s\S]*?)<\/sc-for>/g, function (_, list, as, inner) {
      var arr = get(ctx, list) || [];
      return arr.map(function (item, i) {
        var c = Object.create(ctx); c[as] = item; c.$index = i;
        return fill(inner, c);
      }).join('');
    });
    tpl = tpl.replace(/data-on="([\w.]+)"/g, function (_, p) {
      var fn = get(ctx, p); handlers.push(fn); return 'data-h="' + (handlers.length - 1) + '"';
    });
    return tpl.replace(HOLE, function (_, p) { return esc(get(ctx, p)); });
  }
  window.mountDC = function (Comp) {
    var comp = new Comp({});
    comp.state = comp.state || {};
    comp.setState = function (p) { Object.assign(comp.state, p); render(); };
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-dc-root]'));
    function render() {
      handlers = [];
      var ctx = comp.renderVals();
      roots.forEach(function (r) {
        r.innerHTML = fill(document.getElementById('tpl-' + r.getAttribute('data-dc-root')).textContent, ctx);
      });
    }
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-h]');
      if (el && handlers[+el.getAttribute('data-h')]) handlers[+el.getAttribute('data-h')](e);
    });
    render();
  };
})();
