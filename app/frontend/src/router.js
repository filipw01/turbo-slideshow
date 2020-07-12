import io from 'socket.io-client';
import { createRouter, createWebHistory } from 'vue-router';
import NewRoom from './views/NewRoom.vue';
import JoinRoom from './views/JoinRoom.vue';
import Room from './views/Room.vue';

const socket = io('');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: JoinRoom,
      props: { socket },
    },
    {
      path: '/create-room',
      component: NewRoom,
      props: { socket },
    },
    {
      path: '/room/:roomId',
      component: Room,
      props: { socket },
    },
  ],
});

export default router;
