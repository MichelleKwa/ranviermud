'use strict';

module.exports = srcPath => {
  const Broadcast = require(srcPath + 'Broadcast');
  const Heal = require(srcPath + 'Heal');
  const Player = require(srcPath + 'Player');
  const Flag = require(srcPath + 'EffectFlag');

  return {
    config: {
      name: 'Block',
      description: "You are actively blocking incoming physical attacks!",
      type: 'skill:block',
    },
    flags: [Flag.BUFF],
    state: {
      magnitude: 1,
      type: "isPhysical"
    },
    modifiers: {
      outgoingDamage: (damage, current) => current,
      incomingDamage(damage, currentAmount) {
        if (damage instanceof Heal || damage.attribute !== 'health' || !DamageType[this.state.type](damage.type)) {
          return currentAmount;
        }

        const absorbed = Math.min(this.state.remaining, currentAmount);
        const partial = this.state.remaining < currentAmount ? ' partially' : '';
        this.state.remaining -= absorbed;
        currentAmount -= absorbed;

        Broadcast.sayAt(this.target, `You${partial} block the attack, preventing <bold>${absorbed}</bold> damage!`);
        if (!this.state.remaining) {
          this.remove();
        }

        return currentAmount;
      }
    },
    listeners: {
      effectActivated: function () {
        this.state.remaining = this.state.magnitude;

        if (this.target instanceof Player) {
          this.target.addPrompt('block', () => {
            const width = 60 - "Blocking ".length;
            const remaining = `<b>${this.state.remaining}/${this.state.magnitude}</b>`;
            return "<b>Blocking</b> " + Broadcast.progress(width, (this.state.remaining / this.state.magnitude) * 100, "white") + ` ${remaining}`;
          });
        }
      },

      effectDeactivated: function () {
        Broadcast.sayAt(this.target, 'You lower your defenses, unable to block any more attacks.');
        if (this.target instanceof Player) {
          this.target.removePrompt('block');
        }
      }
    }
  };
};