import { ref, onMounted, onUnmounted } from 'vue';

function useSocketConnect(socket) {
  const connected = ref(socket.connected);
  function connectHandler() {
    connected.value = true;
  }
  function disconnectHandler() {
    connected.value = false;
  }
  onMounted(() => {
    socket.on('connect', connectHandler);
    socket.on('disconnect', disconnectHandler);
  });
  onUnmounted(() => {
    socket.off('connect', connectHandler);
    socket.off('disconnect', disconnectHandler);
  });
  return { connected };
}

export default useSocketConnect;
