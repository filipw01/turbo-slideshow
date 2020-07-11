<template>
  <div class="flex-column">
    <label>
      Prezentacja
      <input type="file" ref="file" />
    </label>
    <button @click="() => changePage(pageNumber - 1)">
      -
    </button>
    {{ pageNumber }}
    <button @click="() => changePage(pageNumber + 1)">
      +
    </button>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import SocketIOFileUpload from 'socketio-file-upload';
import { useRoute, useRouter } from 'vue-router';
import useSocketEvent from '../compositions/socketEvent';
import {
  queueRenderPage,
  setPdfSource,
  getPdf,
} from '../compositions/renderPdf';

export default {
  name: 'App',
  props: {
    socket: Object,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const canvas = ref(null);
    const file = ref(null);
    const pageNumber = ref(0);

    function changePageHandle(newPageNumber) {
      const { numPages } = getPdf();
      if (newPageNumber < 1 || newPageNumber > numPages) {
        return;
      }
      pageNumber.value = newPageNumber;
    }

    function changePresentationHandle(presentationPath) {
      const password = sessionStorage.getItem(
        'roomPassword',
      );
      fetch(`http://localhost:8080${presentationPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      })
        .then((response) => response.arrayBuffer())
        .then(async (arrayBuffer) => {
          const source = new Uint8Array(arrayBuffer);
          await setPdfSource(source);
          pageNumber.value = 1;
        })
        .catch((err) => emit('error', err));
    }
    function joinErrorHandle() {
      router.go(-1);
    }
    onMounted(() => {
      const password = sessionStorage.getItem(
        'roomPassword',
      );
      props.socket.emit('join', {
        name: route.params.roomId,
        password,
      });
      const uploader = new SocketIOFileUpload(props.socket);
      uploader.listenOnInput(file.value);
    });
    function changePage(newPageNumber) {
      props.socket.emit('changePage', newPageNumber);
    }
    watch(pageNumber, () => {
      queueRenderPage(pageNumber.value, canvas.value);
    });
    return {
      changePage,
      pageNumber,
      file,
      canvas,
      ...useSocketEvent(
        props.socket,
        'changePage',
        changePageHandle,
      ),
      ...useSocketEvent(
        props.socket,
        'changePresentation',
        changePresentationHandle,
      ),
      ...useSocketEvent(
        props.socket,
        'join/error',
        joinErrorHandle,
      ),
    };
  },
};
</script>
<style scoped>
.flex-column {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
