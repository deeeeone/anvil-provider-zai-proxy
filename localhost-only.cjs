// Loaded with `node -r` before the proxy: whatever address the proxy asks to listen on,
// it only accepts connections from this Mac, so nobody on your network can use it.
const net = require('net');
const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function (...args) {
  if (typeof args[0] === 'number' || typeof args[0] === 'string') {
    const port = args[0];
    const cb = args.find((a) => typeof a === 'function');
    return listen.call(this, port, '127.0.0.1', cb);
  }
  if (args[0] && typeof args[0] === 'object' && !args[0].path) {
    args[0] = { ...args[0], host: '127.0.0.1' };
  }
  return listen.apply(this, args);
};
