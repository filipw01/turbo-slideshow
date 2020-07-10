import { onMounted, onUnmounted } from 'vue';

function useSocketEvent(socket, eventName, handler) {
  onMounted(() => {
    socket.on(eventName, handler);
  });
  onUnmounted(() => {
    socket.off(eventName, handler);
  });
}

export default useSocketEvent;
