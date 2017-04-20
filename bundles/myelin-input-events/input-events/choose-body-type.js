'use strict';

/**
 * Player body type (for description) selection event
 */

module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Config    = require(srcPath + 'Config');
  const Data      = require(srcPath + 'Data');
  const fs        = require('fs');
  const wrap      = require('wrap-ansi');

  return {
    event: state => (socket, args) => {
      const { playerName, background } = args;
      const say      = EventUtil.genSay(socket);
      const at       = EventUtil.genWrite(socket);
      const wrapDesc = str => say(wrap(str, 40));

      const choices = [
        'slim',
        'athletic',
        'hourglass',
        'pudgy',
        'stocky',
        'boxy',
        'pear-shaped',
        'hunched',
        'musclebound',
        'spoon-shaped',
        'rotund'
      ];
      const desc = {};

      // List possible features.
      say("Appearance:");
      say(`How would you describe ${playerName}'s body type?`);
      say(`${Broadcast.line(40)}/`);
      choices.forEach((choice, index) => {
        at(`[${index + 1}] `);
        say(`<bold>${choice}</bold> `);
        say(""); // Newline to separate.
      });

      socket.once('data', choice => {
        choice = parseInt(choice.toString().trim().toLowerCase(), 10) - 1;

        if (isNaN(choice)) {
          return socket.emit('choose-body-type', socket, args);
        }

        const bodyType = choices[choice];

        if (bodyType) {
          args.desc.bodyType = bodyType;
          socket.emit('finish-player', socket, args);
        } else {
          return socket.emit('choose-body-type', socket, args);
        }
      });
    }
  };
};
