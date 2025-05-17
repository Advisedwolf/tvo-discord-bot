// tests/handlers/modalHandler.spec.js
import { expect } from 'chai';
import sinon from 'sinon';
import modalHandler from '../../src/handlers/modalHandler.js';

describe('modalHandler (production)', () => {
  let interaction, executeSpy;

  beforeEach(() => {
    // Stub interaction.reply so we can inspect calls
    interaction = {
      isModalSubmit: () => true,
      customId: 'unknownModal',
      client: { commands: new Map() },
      user: { locale: 'en' },
      reply: sinon.stub().resolves(),
      followUp: sinon.stub().resolves(),
    };

    // Prepare a registered command under 'myModal'
    executeSpy = sinon.spy();
    interaction.client.commands.set('myModal', { execute: executeSpy });
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should call execute() on a registered modal command', async () => {
    interaction.customId = 'myModal';
    await modalHandler.handle(interaction);

    expect(executeSpy.calledOnceWith(interaction)).to.be.true;
    expect(interaction.reply.notCalled).to.be.true;
  });

  it('should reply ephemerally if the modal command is not found', async () => {
    interaction.customId = 'noSuchModal';
    await modalHandler.handle(interaction);

    // Should have sent exactly one ephemeral reply
    expect(interaction.reply.calledOnce).to.be.true;
    const callArg = interaction.reply.firstCall.args[0];
    expect(callArg).to.have.property('flags', 64);
    expect(callArg).to.have.property('embeds').that.is.an('array').with.lengthOf(1);
  });
});
