import io from 'socket.io-client';
import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import NewRoom from './views/NewRoom.vue';
import JoinRoom from './views/JoinRoom.vue';
import Room from './views/Room.vue';

const socket = io('http://localhost:8080');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
      props: { socket },
    },
    {
      path: '/new-room',
      component: NewRoom,
      props: { socket },
    },
    {
      path: '/join-room',
      component: JoinRoom,
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
