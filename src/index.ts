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

RealtimeHelper.client.connect();
await RabbitMqHelper.init();

const channel = RealtimeHelper.client.channel(
  EmailChannel,
) as RealtimeSubscription;

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

channel.subscribe();
