import 'dotenv/config';
import {JobData, RabbitMqHelper} from '@open-mail-archive/rabbitmq-helper';
import {
  GenericPayload,
  DeletePayload,
  InsertPayload,
  RealtimeHelper,
} from '@open-mail-archive/realtime-helper';
import {EmailChannel, EmailPayload, EmailQueue} from '@open-mail-archive/types';
import {RealtimeSubscription} from '@supabase/realtime-js';
import {Logger} from '@open-mail-archive/logger';

Logger.Instance.info({
  trace: 'EmailsScheduler',
  message: 'Initializing helpers.',
});
RealtimeHelper.client.connect();
await RabbitMqHelper.init();
Logger.Instance.info({
  trace: 'EmailsScheduler',
  message: 'Helpers initialized.',
});

Logger.Instance.info({
  trace: 'EmailsScheduler',
  message: 'Creating the realtime subscription channel.',
});
const channel = RealtimeHelper.client.channel(
  EmailChannel,
) as RealtimeSubscription;
Logger.Instance.debug({
  trace: 'EmailsScheduler',
  message: 'Realtime channel created.',
  data: channel,
});

Logger.Instance.info({
  trace: 'EmailsScheduler',
  message: 'Attaching hooks to channel.',
});
channel.on('*', async (payload: GenericPayload) => {
  let messagePayload: EmailPayload;

  switch (payload.type) {
    case 'INSERT':
      messagePayload = (payload as InsertPayload<EmailPayload>).record;
      break;
    case 'DELETE':
      messagePayload = (payload as DeletePayload<EmailPayload>).old_record;
      break;
    case 'UPDATE':
      // nothing to do here
      return;
  }

  await RabbitMqHelper.send(
    EmailQueue,
    new JobData<EmailPayload>(payload.type, messagePayload).toJson(),
  );
});
Logger.Instance.info({
  trace: 'EmailsScheduler',
  message: 'Hooks attached',
});

Logger.Instance.info({
  trace: 'EmailsScheduler',
  message: 'Subscribing for events...',
});
channel.subscribe();
