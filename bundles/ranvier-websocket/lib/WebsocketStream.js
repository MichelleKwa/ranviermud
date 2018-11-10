'use strict';

const TransportStream = require('../../../src/TransportStream');
const sanitize = require('sanitize-html');
/**
 * Essentially we want to look at the methods of WebSocket and match them to the appropriate methods on TransportStream
 */
class WebsocketStream extends TransportStream
{
  attach(socket) {
    super.attach(socket);
    this.mask = false;
    // websocket uses 'message' instead of the 'data' event net.Socket uses
    socket.on('message', message => {
      this.emit('data', message);
    });
  }

  get writable() {
    return this.socket.readyState === 1;
  }

  write(message) {
    if (!this.writable) {
      return;
    }

    message = sanitize(message);

    // this.socket will be set when we do `ourWebsocketStream.attach(websocket)`
    this.socket.send(JSON.stringify({
      type: 'message',
      message,
    }));
  }

  pause() {
    this.socket.pause();
  }

  resume() {
    this.socket.resume();
  }

  end() {
    // 1000 = normal close, no error
    this.socket.close(1000);
  }

  executeSendData(group, data) {
    if (!this.writable) {
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'data',
      group,
      data
    }));
  }

  executeSendAudio(audioCue, options = {}) {
    if (!this.writeable) {
      return;
    }

    this.socket.send(JSON.stringify({
      type: 'audio',
      audioCue,
      options
    }));
  }
    
   executeToggleEcho() {
    if (!this.writable) {
      return;
    }

    this.mask = !this.mask;
    this.socket.send(JSON.stringify({
      type: 'ui',
      data: {mask: this.mask}
    }));     
   }
}

module.exports = WebsocketStream;
