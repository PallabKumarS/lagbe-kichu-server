import Pusher from 'pusher';
import config from '../config';

const pusher = new Pusher({
  appId: config.pusher_app_id as string,
  key: config.pusher_app_key as string,
  secret: config.pusher_app_secret as string,
  cluster: config.pusher_app_cluster as string,
  useTLS: true,
});

export default pusher;
