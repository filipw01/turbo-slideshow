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
import pdfjs from 'pdfjs-dist/webpack';
import useSocketEvent from '../compositions/socketEvent';

export default {
  name: 'App',
  props: {
    socket: Object,
  },
  setup(props, { emit }) {
    const route = useRoute();
    const router = useRouter();
    const pageNumber = ref(0);
    const canvas = ref(null);
    const file = ref(null);
    const pdf = ref(null);
    let pageRendering = false;
    let pageNumPending = null;
    async function renderPage(num) {
      pageRendering = true;
      const page = await pdf.value.getPage(num);
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      // Prepare canvas using PDF page dimensions
      const context = canvas.value.getContext('2d');
      canvas.value.height = viewport.height;
      canvas.value.width = viewport.width;

      // Render PDF page into canvas context
      const renderContext = {
        canvasContext: context,
        viewport,
      };

      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    }
    function queueRenderPage(num) {
      console.log(num);
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }

    function changePageHandle(newPageNumber) {
      const { numPages } = pdf.value;
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
          pdf.value = await pdfjs.getDocument({
            data: source,
          }).promise;
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
      queueRenderPage(pageNumber.value);
    });
    return {
      changePage,
      pdf,
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
.flex-column > * {
  margin: 6px 0;
}
</style>
